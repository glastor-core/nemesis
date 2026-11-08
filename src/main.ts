import { join } from "@std/path";
import { ensureDir, exists } from "@std/fs";
import * as core from "@actions/core";
import { isActionExecution, loadConfig, showHelp } from "./config.ts";
import {
  filterIgnoredFindings,
  loadNemesisFileConfig,
} from "./config/schema.ts";
import type {
  AuditFinding,
  AuditReport,
  ScannerSummary,
  Severity,
} from "./types.ts";
import { GitleaksScanner } from "./scanners/gitleaks.ts";
import { SemgrepScanner } from "./scanners/semgrep.ts";
import { TrivyScanner } from "./scanners/trivy.ts";
import { HygieneScanner } from "./scanners/hygiene.ts";
import { LicenseScanner } from "./scanners/license.ts";
import type { Scanner } from "./scanners/base.ts";
import { printConsoleReport } from "./reporters/console.ts";
import { generateMarkdownReport } from "./reporters/markdown.ts";
import { generateSarifReport } from "./reporters/sarif.ts";
import { sendWebhookNotification } from "./reporters/webhook.ts";
import { upsertPrComment } from "./github/pr-commenter.ts";
import { createWorkflowAnnotations } from "./github/annotator.ts";
import { getChangedFiles } from "./utils/diff.ts";
import { applyAutoFix } from "./remediation/auto-fix.ts";
import { postPullRequestSuggestions } from "./remediation/suggestions.ts";

async function main() {
  if (Deno.args.includes("-h") || Deno.args.includes("--help")) {
    showHelp();
    Deno.exit(0);
  }

  const config = loadConfig(Deno.args);
  await ensureDir(config.outputDir);

  // 1. Load suppression & project config (.nemesis.yml)
  const fileConfig = await loadNemesisFileConfig(
    config.targetPath,
    config.configFile,
  );
  if (fileConfig) {
    if (config.verbose) {
      console.log(
        `[Nemesis] Loaded config file with ${fileConfig.ignore.length} ignore rules.`,
      );
    }
    if (fileConfig.settings) {
      if (
        fileConfig.settings.maxFileSizeMb &&
        !Deno.args.includes("--max-file-size")
      ) {
        config.maxFileSizeMb = fileConfig.settings.maxFileSizeMb;
      }
      if (
        fileConfig.settings.requireLicense !== undefined &&
        !Deno.args.includes("--require-license")
      ) {
        config.requireLicense = fileConfig.settings.requireLicense;
      }
    }
  }

  // 2. Differential Scanning Check
  if (config.diffMode) {
    const changed = await getChangedFiles(
      config.targetPath,
      config.diffBaseRef,
    );
    if (changed !== null) {
      config.changedFiles = changed;
      console.log(
        `[Nemesis] ⚡ Differential Scan Active: ${changed.length} modified files detected.`,
      );
      if (changed.length === 0) {
        console.log(
          "[Nemesis] No modified files detected in diff. Audit complete.",
        );
      }
    } else {
      console.log(
        "[Nemesis] Differential scan unavailable (not a git repo or compare ref missing). Falling back to full scan.",
      );
    }
  }

  // 3. Register Active Scanners
  const scanners: Scanner[] = [];

  if (config.scanSecrets) {
    scanners.push(new GitleaksScanner());
  }
  if (config.scanSast) {
    scanners.push(new SemgrepScanner());
  }
  if (config.scanSca) {
    scanners.push(new TrivyScanner());
  }
  if (config.scanHygiene) {
    scanners.push(new HygieneScanner());
  }
  if (config.scanLicenses || config.generateSbom) {
    scanners.push(new LicenseScanner());
  }

  if (scanners.length === 0) {
    console.error(
      "No scanners enabled. Use --secrets, --sast, --sca, --hygiene, --licenses or --all.",
    );
    Deno.exit(1);
  }

  console.log(`[Nemesis] Starting audit on: ${config.targetPath}`);
  console.log(
    `[Nemesis] Enabled modules: ${scanners.map((s) => s.name).join(", ")}`,
  );

  const scannerSummaries: ScannerSummary[] = [];
  const rawFindings: AuditFinding[] = [];

  // Run scanners
  for (const scanner of scanners) {
    console.log(`[Nemesis] Running ${scanner.name}...`);
    try {
      const res = await scanner.run(config);
      scannerSummaries.push(res.summary);
      rawFindings.push(...res.findings);
    } catch (err) {
      console.error(`[Nemesis] Error executing scanner ${scanner.name}:`, err);
      scannerSummaries.push({
        tool: scanner.name,
        category: scanner.category,
        status: "failed",
        durationMs: 0,
        error: err instanceof Error ? err.message : String(err),
        counts: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 },
      });
    }
  }

  // 4. Filter findings if Differential Mode is enabled
  let filteredFindings = rawFindings;
  if (config.changedFiles && config.changedFiles.length > 0) {
    const changedSet = new Set(
      config.changedFiles.map((f) => f.replace(/\\/g, "/")),
    );
    filteredFindings = rawFindings.filter((f) => {
      if (!f.file) return true;
      const normalized = f.file.replace(/\\/g, "/");
      return changedSet.has(normalized) ||
        Array.from(changedSet).some((cf) => normalized.includes(cf));
    });
  }

  // 5. Apply Suppressions & False Positives (.nemesis.yml)
  const { active, ignored } = filterIgnoredFindings(
    filteredFindings,
    fileConfig?.ignore ?? [],
  );

  const totalCounts: Record<Severity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  for (const f of active) {
    totalCounts[f.severity]++;
  }

  // 6. Evaluate Pass / Fail against thresholds
  let passed = true;
  let failureReason: string | undefined;

  if (config.failOnCritical && totalCounts.CRITICAL > 0) {
    passed = false;
    failureReason =
      `Found ${totalCounts.CRITICAL} CRITICAL vulnerabilities (fail-on-critical is enabled).`;
  } else if (
    config.failOnHigh && (totalCounts.CRITICAL + totalCounts.HIGH) > 0
  ) {
    passed = false;
    failureReason = `Found ${
      totalCounts.CRITICAL + totalCounts.HIGH
    } HIGH/CRITICAL vulnerabilities (fail-on-high is enabled).`;
  } else if (
    config.failOnMedium &&
    (totalCounts.CRITICAL + totalCounts.HIGH + totalCounts.MEDIUM) > 0
  ) {
    passed = false;
    failureReason = `Found ${
      totalCounts.CRITICAL + totalCounts.HIGH + totalCounts.MEDIUM
    } MEDIUM or higher vulnerabilities.`;
  }

  // 7. Auto-Fix Remediation (Clean toxic files & commit automatically)
  let autoFixedCount = 0;
  let autoFixCommit: string | undefined;

  if (config.autoFix) {
    console.log(
      "[Nemesis] 🤖 Auto-Fix enabled: Applying automatic cleanups...",
    );
    const preReport: AuditReport = {
      timestamp: new Date().toISOString(),
      targetPath: config.targetPath,
      scanners: scannerSummaries,
      findings: active,
      ignoredFindings: ignored,
      totalFindings: active.length,
      counts: totalCounts,
      passed,
    };
    const fixResult = await applyAutoFix(preReport, config);
    autoFixedCount = fixResult.fixedCount;
    autoFixCommit = fixResult.commitSha;
  }

  const sbomReportPath = join(config.outputDir, "sbom.cyclonedx.json");
  const sbomExists = (await exists(sbomReportPath)) && config.generateSbom;

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    targetPath: config.targetPath,
    commitSha: Deno.env.get("GITHUB_SHA"),
    repository: Deno.env.get("GITHUB_REPOSITORY"),
    diffMode: config.diffMode,
    scanners: scannerSummaries,
    findings: active,
    ignoredFindings: ignored,
    totalFindings: active.length,
    counts: totalCounts,
    passed,
    failureReason,
    sbomPath: sbomExists ? sbomReportPath : undefined,
    autoFixedCount,
    autoFixCommit,
  };

  // 8. Output Reports
  // Console
  printConsoleReport(report);

  // JSON Report
  const jsonReportPath = join(config.outputDir, "nemesis-report.json");
  await Deno.writeTextFile(jsonReportPath, JSON.stringify(report, null, 2));

  // Markdown Report
  const markdownContent = generateMarkdownReport(report);
  const mdReportPath = join(config.outputDir, "nemesis-report.md");
  await Deno.writeTextFile(mdReportPath, markdownContent);

  // SARIF Report
  const sarifContent = generateSarifReport(report);
  const sarifReportPath = join(config.outputDir, "nemesis-report.sarif");
  await Deno.writeTextFile(sarifReportPath, sarifContent);

  // 9. Dispatch Webhook Notifications (Slack / Discord)
  if (config.slackWebhookUrl || config.discordWebhookUrl) {
    await sendWebhookNotification(report, {
      slackWebhookUrl: config.slackWebhookUrl,
      discordWebhookUrl: config.discordWebhookUrl,
    });
  }

  // 10. GitHub Actions Specific Outputs & PR Remediation
  const isGitHubActions = isActionExecution(Deno.args);
  if (isGitHubActions) {
    try {
      await core.summary.addRaw(markdownContent).write();
    } catch {
      // Ignored if summary not writable
    }

    core.setOutput("passed", String(report.passed));
    core.setOutput("total-findings", String(report.totalFindings));
    core.setOutput("critical-count", String(report.counts.CRITICAL));
    core.setOutput("high-count", String(report.counts.HIGH));
    core.setOutput("ignored-count", String(ignored.length));
    core.setOutput("auto-fixed-count", String(autoFixedCount));
    core.setOutput("report-json", jsonReportPath);
    core.setOutput("report-md", mdReportPath);
    core.setOutput("report-sarif", sarifReportPath);
    if (sbomExists) {
      core.setOutput("sbom-file", sbomReportPath);
    }

    // Code line annotations on PR diff
    if (config.createAnnotations) {
      createWorkflowAnnotations(report.findings);
    }

    // Interactive 1-click Pull Request Review Suggestions
    if (config.prSuggestions && config.githubToken) {
      await postPullRequestSuggestions(config.githubToken, report);
    }

    // PR Comment Upsert
    if (config.postPrComment && config.githubToken) {
      await upsertPrComment(config.githubToken, markdownContent);
    }

    if (!passed) {
      core.setFailed(
        failureReason ?? "Security audit failed threshold requirements.",
      );
    }
  } else if (!passed) {
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}

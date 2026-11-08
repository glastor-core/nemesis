# 🛡️ Nemesis — Universal DevSecOps Auditor & Auto-Remediation Bot

<p align="center">
  <a href="https://github.com/marketplace/actions/nemesis-universal-security-hygiene-compliance-auditor"><img src="https://img.shields.io/badge/GitHub_Marketplace-Nemesis-purple.svg?logo=github&style=for-the-badge" alt="GitHub Marketplace" /></a>
  <a href="https://github.com/glastor-core/nemesis/actions"><img src="https://img.shields.io/github/actions/workflow/status/glastor-core/nemesis/ci.yml?branch=main&label=CI%20Audit&style=for-the-badge" alt="CI Status" /></a>
  <a href="https://deno.com"><img src="https://img.shields.io/badge/Deno-v2.x-000000.svg?logo=deno&style=for-the-badge" alt="Deno Runtime" /></a>
  <a href="https://cyclonedx.org"><img src="https://img.shields.io/badge/SBOM-CycloneDX%201.5-blueviolet?style=for-the-badge" alt="CycloneDX SBOM" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License" /></a>
</p>

> **Official GitHub Action and DevSecOps, Repo Hygiene, Auto-Fix & Compliance
> CLI engine built with Deno and TypeScript.**\
> Automatically audits exposed secrets (Gitleaks + native engine), code
> vulnerabilities (SAST Semgrep), vulnerable dependencies (SCA Trivy), open
> source licenses (Copyleft), generates CycloneDX 1.5 SBOM software bills of
> materials, creates **automatic cleanup commits (Auto-Fix)**, and posts
> **interactive 1-click Pull Request review suggestions**.

---

## 🚀 Key Features

- 🤖 **Automated Cleanup Commits (Auto-Fix):**
  - Automatically deletes toxic or temporary files (`.DS_Store`, `Thumbs.db`,
    `.env.local`, logs) accidentally committed to the repository.
  - Automatically appends corresponding ignore rules to `.gitignore`.
  - Performs an automated bot commit
    (`chore(nemesis): auto-clean toxic files [skip ci]`) and pushes it to the
    Pull Request branch.
- 💡 **Interactive 1-Click PR Review Suggestions (GitHub Review Suggestions):**
  - For vulnerable dependencies or exposed credentials, posts inline code review
    comments with interactive suggestion blocks.
  - Developers can simply click **"Commit suggestion"** in GitHub to apply the
    fix immediately without opening an editor.
- 🔑 **Hybrid Secret Scanning (Gitleaks + Native Engine):**
  - Detects API keys and secrets (AWS, OpenAI, GitHub PAT, Google Cloud, Slack,
    JWT, Private Keys) across current files and Git history.
  - If Gitleaks is not installed in the local environment, a zero-dependency,
    high-fidelity native Deno regex engine activates automatically.
- 🛡️ **SAST - Static Application Security Testing (Semgrep):**
  - Identifies common vulnerabilities (SQL injections, XSS, RCE, insecure
    deserialization, broken cryptography) across 30+ programming languages
    without compiling.
- 📦 **SCA - Dependency Scanning (Trivy):**
  - Detects known CVEs across package managers (`npm`, `pip`, `go`, `cargo`,
    `maven`, `nuget`) and infrastructure misconfigurations (Dockerfile,
    Kubernetes).
- 📜 **License Compliance & SBOM (CycloneDX 1.5):**
  - Flags high-risk copyleft licenses (`GPL-3.0`, `AGPL-3.0`, `SSPL`) that could
    compromise proprietary or closed-source commercial code.
  - Automatically produces a **CycloneDX 1.5 standard SBOM** inventory
    (`sbom.cyclonedx.json`) for regulatory audits (NIST, ISO 27001, Executive
    Order 14028).
- 🧹 **Repository Hygiene & Cleanliness (Native Deno):**
  - **Toxic / Junk Files:** Detects `.env`, `.DS_Store`, `Thumbs.db`, `*.log`,
    temporary `*.bak`, or dump `*.dump` files.
  - **Forbidden Directories:** Alerts when dependency or build directories
    (`node_modules/`, `vendor/`, `__pycache__/`) are committed.
  - **Large Files (Blob Bloat):** Identifies files larger than 10 MB (or your
    configured threshold) that should use Git LFS.
  - **Health & Governance:** Verifies the presence of `.gitignore`, `README.md`,
    and `LICENSE`.
- ⚡ **Differential Scanning (`diff-mode`):**
  - In Pull Requests, audits **only modified files**, cutting execution time on
    large codebases from minutes down to seconds.
- 🎯 **False Positive Management via `.nemesis.yml`:**
  - Allows suppressing justified findings by rule ID, CVE, or file path,
    requiring an explanatory `reason` and supporting an optional `expires` date.
- 📢 **Webhook Alerts (Slack & Discord):**
  - Dispatches formatted summary notification cards to Slack or Discord channels
    upon audit completion.
- 💬 **Intelligent Pull Request Feedback:**
  - Traffic-light Markdown PR comment updated _in-place_ (no duplicate spam) and
    direct inline annotations on the PR diff.
- 📑 **Native SARIF Integration:**
  - Displays code scanning alerts directly under the GitHub repository
    **Security -> Code Scanning** tab.

---

## 📦 Quick Start: Integrate into Any Repository

To audit and **automatically remediate** in any repository, create
`.github/workflows/security-audit.yml`:

```yaml
name: Security & Hygiene Audit

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

permissions:
  contents: write # Required for Auto-Fix cleanup commits
  pull-requests: write # Required for comments and 1-click review suggestions
  security-events: write # Required for SARIF alerts in the Security tab

jobs:
  audit:
    name: Nemesis Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Nemesis Auditor & Remediation Bot
        uses: glastor-core/nemesis@v1
        with:
          auto-fix: true # Automatically cleans junk files and commits fixes
          pr-suggestions: true # Posts 1-click review suggestions for dependencies
          diff-mode: true # Scans only files modified in the PR
          scan-hygiene: true # Checks cleanliness and unwanted files
          scan-licenses: true # Checks for restrictive open-source licenses
          generate-sbom: true # Generates CycloneDX SBOM report
          upload-sarif: true # Publishes alerts to GitHub Security tab
```

### ⚡ Minimal Example (Zero-Config)

If you only want to audit your repository with default settings:

```yaml
- name: Nemesis Security Audit
  uses: glastor-core/nemesis@v1
```

---

## 🔐 Required GitHub Permissions (`permissions`)

Depending on the features enabled, your workflow requires the following
permissions in GitHub Actions:

| Permission               |             Required By             | Purpose                                                                        |
| :----------------------- | :---------------------------------: | :----------------------------------------------------------------------------- |
| `contents: write`        |          `auto-fix: true`           | Allows the bot to commit and push junk file removals and `.gitignore` updates. |
| `pull-requests: write`   | `post-pr-comment`, `pr-suggestions` | Posts/updates comments and generates interactive review suggestions on the PR. |
| `security-events: write` |        `upload-sarif: true`         | Uploads the SARIF report to the **Security -> Code Scanning** tab.             |
| `contents: read`         |           Read-only audit           | Allows checking out and analyzing the repository.                              |

---

## 🎯 Suppressions & False Positive Configuration (`.nemesis.yml`)

To suppress justified alerts (e.g., mock credentials in test suites or a CVE
mitigated by infrastructure controls), add a `.nemesis.yml` file to the root of
your repository:

```yaml
version: "1"

ignore:
  - id: "SECRET-aws-access-token-1"
    path: "tests/mocks/**"
    reason: "Mock credential used for unit tests"

  - cve: "CVE-2023-12345"
    reason: "Mitigated by WAF firewall rules in production"
    expires: "2026-12-31" # Expires to enforce periodic re-evaluation

settings:
  maxFileSizeMb: 15
  requireLicense: true
```

---

## ⚙️ Input Parameters (`inputs`)

All parameters are optional and come with defaults tuned for DevSecOps best
practices:

| Parameter             |  Type   |               Default                | Description                                                              |
| :-------------------- | :-----: | :----------------------------------: | :----------------------------------------------------------------------- |
| `target-path`         | string  |                 `.`                  | Directory or repository path to audit.                                   |
| `scan-secrets`        | boolean |                `true`                | Enables exposed secrets scanning (Gitleaks + native engine).             |
| `scan-sast`           | boolean |                `true`                | Enables static application security testing (Semgrep).                   |
| `scan-sca`            | boolean |                `true`                | Enables vulnerable dependency scanning (Trivy).                          |
| `scan-hygiene`        | boolean |                `true`                | Enables repository cleanliness and hygiene checks.                       |
| `scan-licenses`       | boolean |                `true`                | Audits restrictive copyleft licenses (GPL, AGPL, SSPL).                  |
| `generate-sbom`       | boolean |                `true`                | Generates a CycloneDX SBOM file (`sbom.cyclonedx.json`).                 |
| `diff-mode`           | boolean |               `false`                | Scans only files changed in the current PR or commit.                    |
| `diff-base-ref`       | string  |           `'origin/main'`            | Base Git ref used for differential comparison.                           |
| `auto-fix`            | boolean |               `false`                | Automatically removes junk files and pushes cleanup commits.             |
| `pr-suggestions`      | boolean |                `true`                | Posts 1-click review suggestions on PRs for dependency/credential fixes. |
| `max-file-size-mb`    | string  |                `'10'`                | Maximum file size in MB before warning for blob bloat.                   |
| `require-license`     | boolean |               `false`                | Requires a LICENSE file in the repository root.                          |
| `fail-on-critical`    | boolean |               `false`                | Fails pipeline step if `CRITICAL` vulnerabilities are found.             |
| `fail-on-high`        | boolean |               `false`                | Fails pipeline step if `HIGH` or `CRITICAL` vulnerabilities are found.   |
| `fail-on-medium`      | boolean |               `false`                | Fails pipeline step if `MEDIUM` or higher vulnerabilities are found.     |
| `post-pr-comment`     | boolean |                `true`                | Posts/updates a traffic-light summary Markdown comment on the PR.        |
| `create-annotations`  | boolean |                `true`                | Creates line-level annotations directly on the PR diff.                  |
| `upload-sarif`        | boolean |                `true`                | Uploads the SARIF report to GitHub Security tab.                         |
| `output-dir`          | string  |         `'.nemesis-reports'`         | Directory where generated reports are stored.                            |
| `config-file`         | string  |                 `''`                 | Custom path to `.nemesis.yml` configuration file.                        |
| `slack-webhook-url`   | string  |                 `''`                 | Webhook URL for Slack alerts.                                            |
| `discord-webhook-url` | string  |                 `''`                 | Webhook URL for Discord alerts.                                          |
| `github-token`        | string  |        `${{ github.token }}`         | GitHub token for PR commenting and SARIF upload.                         |
| `semgrep-rules`       | string  |         `'p/security-audit'`         | Semgrep rule set or config path to run.                                  |
| `trivy-severity`      | string  | `'UNKNOWN,LOW,MEDIUM,HIGH,CRITICAL'` | Vulnerability severities captured with Trivy.                            |

---

## 📤 Output Parameters (`outputs`)

Nemesis provides the following step outputs accessible by subsequent jobs or
steps in your workflow:

| Output             |          Type           | Description                                                        |
| :----------------- | :---------------------: | :----------------------------------------------------------------- |
| `passed`           | string (`true`/`false`) | Whether the audit passed configured threshold criteria.            |
| `total-findings`   |     string (number)     | Total count of active findings discovered.                         |
| `critical-count`   |     string (number)     | Count of vulnerabilities with `CRITICAL` severity.                 |
| `high-count`       |     string (number)     | Count of vulnerabilities with `HIGH` severity.                     |
| `ignored-count`    |     string (number)     | Count of findings suppressed via `.nemesis.yml`.                   |
| `auto-fixed-count` |     string (number)     | Count of issues automatically resolved by Auto-Fix.                |
| `report-json`      |      string (path)      | Path to the full JSON report (`nemesis-report.json`).              |
| `report-md`        |      string (path)      | Path to the formatted Markdown report (`nemesis-report.md`).       |
| `report-sarif`     |      string (path)      | Path to the standard SARIF 2.1.0 report (`nemesis-report.sarif`).  |
| `sbom-file`        |      string (path)      | Path to the generated CycloneDX SBOM file (`sbom.cyclonedx.json`). |

---

## 📁 Generated Report Files

Nemesis automatically writes the following report artifacts into the directory
specified by `output-dir` (default `.nemesis-reports`):

| File                   |    Format     | Purpose                                                                       |
| :--------------------- | :-----------: | :---------------------------------------------------------------------------- |
| `nemesis-report.json`  |     JSON      | Complete audit dataset structured for SIEM/SecOps ingestion.                  |
| `nemesis-report.md`    |   Markdown    | Visual summary table with traffic-light status for PRs and CI step summaries. |
| `nemesis-report.sarif` |  SARIF 2.1.0  | Industry standard format for GitHub Code Scanning integration.                |
| `sbom.cyclonedx.json`  | CycloneDX 1.5 | Software bill of materials for NIST, ISO 27001, and regulatory compliance.    |

---

## 💻 Local Usage (CLI with Deno)

Nemesis can be executed locally without depending on GitHub Actions:

```bash
# Audit entire repository (Security + Hygiene + Licenses + SBOM)
deno task start --path .

# Audit and automatically clean up junk files
deno task start --path . --hygiene --auto-fix

# Differential mode: audit only files changed relative to master
deno task start --path . --diff

# Run unit test suite
deno task test

# Compile standalone executable for Windows/Linux/macOS
deno task compile
```

---

## 🪝 Native Git Hooks & Push Protection (Zero-Dependency Shift-Left)

Nemesis includes native Git hooks with zero external dependencies (no Node.js,
npm, or `node_modules` required). To install them locally:

```bash
deno task setup
```

This automatically configures industry-standard **Push Protection**:

1. **`pre-commit`**: Runs `deno fmt --check`, `deno lint`, `deno check`,
   `deno test`, and a differential Nemesis audit (`--diff --fail-on-critical`)
   to block committing exposed secrets or junk files.
2. **`pre-push`**: Activates **native push protection** (_Push Protection_),
   scanning the outgoing code delta before changes leave the developer
   workstation.
3. **`commit-msg`**: Validates that commit messages strictly adhere to
   [Conventional Commits](.github/COMMIT_CONVENTION.md) before finalizing.

---

## 🏛️ Glastor Core Architecture

Nemesis is the cornerstone security component of the **Glastor Core** ecosystem:

- 🛡️ **DevSecOps & Security Gateways:** Enforces _Continuous Audit & Push
  Protection_ across CI/CD pipelines and developer workstations.
- 📦 **High-Performance Libraries & CLI:** Provides _Zero-Dependency_ standalone
  binaries compiled for multiple platforms (Linux, Windows, macOS x86 and ARM64)
  alongside native TypeScript scanning engines.
- ⚡ **Edge Engines & Microservices:** Secures and validates repositories for
  high-throughput edge engines and microservices (such as Glastor Medusa and
  Hyper-Flow).

---

## 📄 License

Distributed under the [MIT License](LICENSE).

© 2010–2026 [GLASTOR®](https://glastor.es/) (INPI Reg. 4559568 & 4559567) •
Dual-Hub Operations (Spain & Argentina · Factura E) • Led by
[@glastor-dev](https://github.com/glastor-dev) (GitHub Developer Program
Member).

import { assertEquals } from "@std/assert";
import { loadConfig } from "../src/config.ts";

Deno.test("loadConfig parses default options correctly", () => {
  const config = loadConfig([]);
  assertEquals(config.targetPath, ".");
  assertEquals(config.scanSecrets, true);
  assertEquals(config.scanSast, true);
  assertEquals(config.scanSca, true);
  assertEquals(config.scanHygiene, true);
  assertEquals(config.scanLicenses, true);
  assertEquals(config.autoFix, false);
  assertEquals(config.diffMode, false);
});

Deno.test("loadConfig parses custom CLI flags correctly", () => {
  const config = loadConfig([
    "--path",
    "my-repo",
    "--auto-fix",
    "--diff",
    "--fail-on-critical",
    "--max-file-size",
    "25",
  ]);

  assertEquals(config.targetPath, "my-repo");
  assertEquals(config.autoFix, true);
  assertEquals(config.diffMode, true);
  assertEquals(config.failOnCritical, true);
  assertEquals(config.maxFileSizeMb, 25);
});

Deno.test("loadConfig enables specific scanners when selectively called", () => {
  const config = loadConfig(["--hygiene", "--secrets"]);
  assertEquals(config.scanHygiene, true);
  assertEquals(config.scanSecrets, true);
  assertEquals(config.scanSast, false);
  assertEquals(config.scanSca, false);
});

Deno.test("loadConfig preserves CLI flags even inside GITHUB_ACTIONS runner", () => {
  const prev = Deno.env.get("GITHUB_ACTIONS");
  Deno.env.set("GITHUB_ACTIONS", "true");
  try {
    const config = loadConfig(["--path", "ci-repo", "--hygiene"]);
    assertEquals(config.targetPath, "ci-repo");
    assertEquals(config.scanHygiene, true);
    assertEquals(config.scanSast, false);
  } finally {
    if (prev === undefined) {
      Deno.env.delete("GITHUB_ACTIONS");
    } else {
      Deno.env.set("GITHUB_ACTIONS", prev);
    }
  }
});

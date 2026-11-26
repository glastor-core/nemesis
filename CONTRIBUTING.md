# Contributing to GLASTOR® Core

Thank you for your interest in contributing to **GLASTOR® Core**! We build
high-performance, resilient systems and developer tools in Rust,
TypeScript/Deno, and WebAssembly. This document provides clear guidelines to
ensure smooth, high-signal collaboration.

---

## Code of Conduct & Governance

- All contributors are expected to uphold our
  [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations to
  [`founder@glastor.es`](mailto:founder@glastor.es).
- For security vulnerabilities, **never open a public issue**—follow our
  [Security Policy](https://github.com/glastor-core/.github/blob/main/SECURITY.md).
- Review our
  [Governance Model](https://github.com/glastor-core/.github/blob/main/GOVERNANCE.md)
  and
  [Public Roadmap](https://github.com/glastor-core/.github/blob/main/ROADMAP.md)
  for project direction and merge authority.

---

## Finding Work, Reporting Bugs & Proposing Changes

- **First-Time Contributors:** Look for issues labeled `good first issue` or
  `help wanted` across
  [`glastor-core` repositories](https://github.com/glastor-core). Comment on the
  issue to claim it before starting work.
- **Reporting Bugs:** Open an issue using the repository's bug report template
  with exact reproduction steps, OS/toolchain versions (`rustc --version`,
  `deno --version`, `node -v`), expected vs. actual behavior, and minimal logs.
- **Large Changes & Architecture Proposals (RFCs):** Before investing time in a
  major refactor, new public API, or breaking change, open a **GitHub
  Discussion** or **Feature Request Issue** first to align on design and scope
  with maintainers.

---

## Development Workflow

We follow a structured Git branching model and enforce **Linear History** via
Squash & Merge.

```text
main (production-ready, releases)
  └── feature/your-feature-name
  └── fix/issue-description
  └── refactor/component-name
```

### 1. Fork, Clone & Sync Upstream

1. Fork the repository to your own GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/nemesis.git
   cd nemesis
   ```
3. Add the `upstream` remote and keep `main` up to date:
   ```bash
   git remote add upstream https://github.com/glastor-core/nemesis.git
   git fetch upstream
   git rebase upstream/main
   ```

### 2. Create a Feature Branch

Always create a branch named according to its purpose:

- `feature/<name>` for new features or capabilities
- `fix/<name>` for bug fixes
- `perf/<name>` for performance optimizations
- `docs/<name>` for documentation updates
- `refactor/<name>` for code restructurings

```bash
git checkout -b feature/dynamic-stream-engine
```

---

## Local Hygiene & Verification

Before opening a Pull Request, run the verification suite for the repository's
stack and ensure **zero errors and zero warnings**:

```bash
# Rust (Cargo workspaces: pii-veil, spec-stream, byte-gauge, specter, strata, hyper64)
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace

# Deno (glastor-core, nemesis, vortex, zerho, medusa, hyper-flow)
deno fmt --check && deno lint && deno test -A

# Node.js / pnpm / Bun (where applicable)
pnpm run lint && pnpm test
```

---

## Commit Guidelines (Conventional Commits)

We enforce the
[Conventional Commits v1.0.0](https://www.conventionalcommits.org/)
specification. This drives automated semantic versioning and changelog
generation.

### Commit Structure

```text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types

- **`feat`**: A new feature (corresponds to a MINOR version bump)
- **`fix`**: A bug fix (corresponds to a PATCH version bump)
- **`perf`**: A code change that improves performance
- **`refactor`**: A code change that neither fixes a bug nor adds a feature
- **`test`**: Adding missing tests or correcting existing tests
- **`docs`**: Documentation only changes
- **`style`**: Formatting or style changes that do not affect code behavior
- **`chore`**: Maintenance tasks, build system updates, or tooling configuration
- **`ci`**: Changes to CI/CD configuration files and scripts

### Breaking Changes

Breaking changes MUST include `BREAKING CHANGE:` in the footer or `!` after the
type/scope (e.g., `feat(api)!: migrate to stream protocol`). Unmarked breaking
API mutations are automatically blocked by **Specter**.

### Signed Commits & DCO

We encourage GPG/SSH-signed commits (`-S`) and Developer Certificate of Origin
sign-off (`-s`):

```bash
git commit -s -S -m "feat(core): implement high-throughput event ring buffer"
```

---

## AI-Assisted Contributions Policy

AI-assisted coding tools are welcome, provided every contributor upholds full
engineering accountability:

1. **Human Review & Understanding:** You must review, understand, and be able to
   explain every line of code you submit.
2. **Verified Locally:** All formatting, linter (`clippy` / `deno lint`), and
   unit/integration tests must pass locally before opening a PR.
3. **No Low-Effort / Drive-By PRs:** Unverified AI-generated PRs, hallucinated
   APIs, or unrelated churn will be closed.

---

## Quality Standards & Automated CI Gates

Every Pull Request is validated automatically by our **GLASTOR® Core** pipeline:

1. **CI Matrix & Tests:** Cross-platform builds, formatting, lints, and
   unit/integration tests.
2. **Nemesis (`glastor-core/nemesis`):** DevSecOps posture, secret scanning, and
   repo hygiene.
3. **Specter (`glastor-core/specter`):** Zero-compiler AST API contract diff &
   Trojan Breaking Change guard.
4. **Byte-Gauge (`glastor-core/byte-gauge`):** SIMD binary/Wasm hardening
   (`checksec`), entropy, and size regression audit (for compiled artifacts).
5. **CodeQL & OpenSSF Scorecard:** Static application security testing (SAST)
   and supply-chain verification.

Ensure also that:

- **Atomic PRs:** One PR solves one discrete responsibility with corresponding
  tests.
- **No secrets or credentials:** Never commit `.env`, private keys, or live
  tokens.
- **Documentation parity:** Update `README.md`, doc comments, or examples when
  public APIs change.

---

## Submitting a Pull Request & Review Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/dynamic-stream-engine
   ```
2. Open a Pull Request targeting `main`.
3. Fill out all sections of the
   [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Link relevant issues using GitHub keywords (e.g., `Closes #42`).
5. Wait for all required CI and security checks to pass.
6. Maintainers review PRs in order of priority and will request changes or
   squash-merge once approved.

---

## Licensing & Contributions (DCO)

By submitting a Pull Request or patch to any **GLASTOR® Core** repository, you
certify that you have the right to submit the work (in accordance with the
[Developer Certificate of Origin](https://developercertificate.org/)) and agree
that your contribution will be licensed under the repository's open-source
license (**MIT** and/or **Apache-2.0**, as declared in the repository's
`LICENSE` file).

Thank you for making **GLASTOR® Core** better!

# Changelog

<p align="center">
  <img src="https://img.shields.io/badge/Format-Keep%20a%20Changelog-blue.svg" alt="Keep a Changelog">
  <img src="https://img.shields.io/badge/Versioning-SemVer%202.0.0-green.svg" alt="Semantic Versioning">
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License MIT">
</p>

---

## Acerca de este Changelog

Todos los cambios notables en **Nemesis (Universal Security, Hygiene &
Compliance Auditor)** son documentados en este archivo.

Este proyecto se adhiere a:

- **Formato:** [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
- **Versionado:** [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

### Categorías de Cambios

- **Added** ✨ - Nuevas características o funcionalidades
- **Changed** 🔄 - Cambios en funcionalidades existentes
- **Fixed** 🐛 - Correcciones de errores
- **Security** 🔒 - Mejoras de seguridad y protección

---

## [Unreleased]

### 💡 Planned

- Integración con modelos LLM para auto-generación de parches de código en
  vulnerabilidades complejas.
- Soporte para reglas de Conventional Commits en el módulo de higiene.

---

## [1.4.0] - 2026-11-08

### ✨ Added

- feat(ci): integrate specter@v1 & vortex@v1, upgrade actions, and fix CLI
  config (`c1a2f6e`)

---

## [1.3.0] - 2026-10-24

### ✨ Added

- feat(ci): automate semantic versioning on push and harden supply chain
  dependencies (`f930289`)
- feat(core): release v1.2.1 with docker resilience and push protection
  (`ab3bddf`)

---

## [1.2.1] - 2026-10-23

**Nombre del Release:** "Docker Engine Resilience, Push Protection & Glastor
Core Alignment"\
**Tipo de Release:** Patch / Resiliency Release

### 🐛 Fixed

- **Verificación Real de Docker Engine:** `checkTool` ahora verifica el estado
  del daemon con `docker info` (evitando falsos positivos cuando solo el CLI
  client está instalado pero el motor está inactivo).
- **Fallbacks Incondicionales ante Fallo de Reporte:** Si `gitleaks` o `trivy`
  no producen el reporte JSON, se ejecuta de forma segura el analizador nativo
  en lugar de devolver 0 hallazgos.
- **Cancelación Real de Subprocesos:** Se conecta
  `signal: abortController.signal` a `Deno.Command` en `runCommand` para aplicar
  timeouts reales ante procesos colgados.

### ✨ Added

- **Git Hook de Push Protection (`pre-push`):** Intercepta y bloquea envíos con
  secretos o vulnerabilidades críticas antes de alcanzar el repositorio remoto.
- **Resolución Dinámica de Líneas en PR Suggestions:** Identificación automática
  del número de línea para paquetes con CVEs en manifiestos (`package.json`,
  `deno.json`), activando revisiones interactivas de 1-clic.
- **Fusión de `.nemesis.yml` en Runtime:** Sincronización automática de
  `settings` (`maxFileSizeMb`, `requireLicense`) con la configuración activa.
- **Tareas de Compilación Darwin:** Tareas `compile:darwin` y
  `compile:darwin-arm` en `deno.json` para compilación local en macOS.

### 🔄 Changed

- **Herramientas de Auditoría en `action.yml`:** Actualizado Gitleaks a
  `v8.30.1`, Trivy a `v0.76.0`, y agregado `--break-system-packages` para
  Semgrep en Ubuntu 24.04 (PEP 668).
- **Alineación de Gobernanza:** Migración completa de referencias a la
  organización `glastor-core/nemesis` y documentación de la arquitectura de 3
  pilares de Glastor Core en `README.md`.

---

## [1.2.0] - 2026-10-13

**Nombre del Release:** "Native Scanning Resilience & Automated Testing"\
**Tipo de Release:** Minor Feature Release

### ✨ Added

#### Suite de Pruebas Automatizadas

- **Suite de Tests con `@std/assert`:** Incorporación de pruebas unitarias para
  configuración de CLI, validación de `.nemesis.yml`, supresión con fecha de
  caducidad, auditoría de higiene, generación de SARIF 2.1.0 y escaneo nativo de
  secretos (`deno test --allow-all`).
- **Paso `deno test` en CI:** Integración de pruebas automáticas y `deno lint`
  en el pipeline de GitHub Actions (`.github/workflows/ci.yml`).

#### Resiliencia con Escaneo Nativo (Zero External Dependencies)

- **Fallback Nativo de Secret Scanning:** Motor interno de expresiones regulares
  de alta fidelidad en `GitleaksScanner` que detecta tokens de GitHub, AWS Keys,
  OpenAI, Anthropic, Slack y claves privadas RSA/SSH cuando Gitleaks o Docker no
  están instalados.
- **Fallback Nativo de Licencias & SBOM:** Motor interno en `LicenseScanner` que
  audita archivos `LICENSE` en raíz y manifiestos (`deno.json`, `package.json`,
  `Cargo.toml`), alertando sobre licencias copyleft y generando CycloneDX SBOM
  sin requerir Trivy.

#### DevSecOps & Higiene Avanzada

- **Auditoría de Permisos en Workflows de CI/CD:** Detección de workflows en
  `.github/workflows/` que omitan la declaración explícita de `permissions:`
  (riesgo de permisos abiertos por defecto) o que usen `permissions: write-all`.
- **Detección de Conflictos de Merge Git:** Alerta de severidad alta ante
  delimitadores de conflicto no resueltos (`<<<<<<< HEAD`, `=======`,
  `>>>>>>>`).

#### Distribución y Releases

- **Pipeline de Release Multi-plataforma (`.github/workflows/release.yml`):**
  Compilación automatizada de binarios nativos independientes para Linux
  (x86_64), Windows (x86_64) y macOS (x86_64 y ARM64 Apple Silicon) con sumas de
  verificación SHA-256 adjuntas en cada tag de versión.

---

## [1.1.0] - 2026-10-13

**Nombre del Release:** "Auto-Remediation & Enterprise Compliance"\
**Tipo de Release:** Minor Feature Release

### ✨ Added

#### Auto-Remediación & Bot Activo

- **Commits Automáticos de Limpieza (`auto-fix`):** Motor de remediación que
  elimina automáticamente archivos basura (`.DS_Store`, `Thumbs.db`,
  `.env.local`, logs) y actualiza `.gitignore` mediante un commit automático del
  bot con etiqueta `[skip ci]`.
- **Sugerencias de 1-Clic en PRs (`pr-suggestions`):** Integración con la API de
  GitHub Reviews para publicar bloques interactivos ````suggestion en
  dependencias vulnerables (SCA) y credenciales expuestas (Secret Scanning).

#### Gobernanza & Supresión de Falsos Positivos

- **Motor de Exclusiones con Zod (`.nemesis.yml`):** Soporte para reglas de
  ignorado con justificación obligatoria (`reason`), ruta de archivo, regla/CVE
  y fecha de caducidad opcional (`expires`).
- **Escaneo Diferencial (`--diff`):** Modo de alta velocidad para auditar
  únicamente archivos modificados o agregados en el Pull Request frente a la
  rama base (`git diff --name-only`).

#### Cumplimiento Normativo & Notificaciones

- **Auditoría de Licencias Open Source:** Detección de licencias _copyleft_ de
  alto riesgo (`GPL-3.0`, `AGPL-3.0`, `SSPL`).
- **Generación de SBOM (CycloneDX):** Exportación automática del inventario de
  software `sbom.cyclonedx.json` para auditorías NIST / ISO 27001.
- **Webhooks de Alerta:** Notificador de tarjetas informativas para canales de
  **Slack** y **Discord**.
- **Soporte de Variables de Entorno Seguras:** Carga automática mediante
  `--env`, creación de [.env.example](.env.example) y exclusión obligatoria de
  `.env` en [.gitignore](.gitignore).

#### Infraestructura CI/CD

- **Caché de Vulnerabilidades:** Integración de `actions/cache@v4` en
  [action.yml](action.yml) para acelerar descargas repetidas de bases de datos
  de Trivy.

---

## [1.0.0] - 2026-10-12

**Nombre del Release:** "Initial Universal DevSecOps Core"\
**Tipo de Release:** Major Initial Release

### ✨ Added

- **Núcleo Deno & TypeScript:** Arquitectura modular de escaneo de alto
  rendimiento sin `node_modules` ni pasos de empaquetado.
- **Módulos de Auditoría Integrados:**
  - **Secret Scanning:** Integración con Gitleaks para auditar claves de API,
    tokens privados e historial de Git.
  - **SAST:** Integración con Semgrep para análisis sintáctico de código en más
    de 30 lenguajes.
  - **SCA:** Integración con Trivy para detectar CVEs en gestores de
    dependencias y malas configuraciones de IaC.
  - **Repository Hygiene (`HygieneScanner`):** Detección nativa de archivos
    basura, toxic directories y archivos con sobrepeso (>10 MB).
- **Reporters Multi-formato:**
  - Consola con colores y tablas resumen (`reporters/console.ts`).
  - Markdown interactivo tipo semáforo con actualización _in-place_ en Pull
    Requests (`reporters/markdown.ts`).
  - Estandarización a **SARIF 2.1.0** para integración con la pestaña _Security
    / Code scanning_ de GitHub.
- **Empaquetado Binario:** Tareas de compilación a ejecutables nativos
  independientes mediante `deno compile`.
- **Licencia:** Adopción formal de la Licencia MIT.

---

## Enlaces & Recursos

- 📖 [README.md](README.md) - Documentación General
- 🏛️ [CONTRIBUTORS.md](CONTRIBUTORS.md) - Gobernanza y Contribuciones
- 📜 [LICENSE](LICENSE) - Términos de Licencia MIT
- 🏷️ [CITATION.cff](CITATION.cff) - Referencia Académica y Metadatos de Software

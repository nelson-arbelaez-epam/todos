#!/usr/bin/env bash
# tools/e2e/scripts/run-e2e-ci.sh
#
# CI e2e runner — designed to be called from GitHub Actions workflows.
#
# Key differences from run-e2e.sh:
#   - Assumes Firebase emulator is already started by the workflow
#     (docker-compose or firebase-tools emulator:exec pattern).
#   - Writes JUnit XML reports to tools/e2e/reports/ for upload as artifacts.
#   - Exits non-zero on any suite failure.
#   - Accepts the same --suite and --smoke flags as run-e2e.sh.
#
# Usage in a GitHub Actions step:
#   - name: Run e2e smoke tests
#     run: ./tools/e2e/scripts/run-e2e-ci.sh --smoke
#
#   - name: Run full e2e (nightly)
#     run: ./tools/e2e/scripts/run-e2e-ci.sh
#
# Reports are written to tools/e2e/reports/ as junit-<suite>.xml.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
REPORTS_DIR="${SCRIPT_DIR}/../reports"

mkdir -p "${REPORTS_DIR}"

SUITE="all"
SMOKE_ONLY=false

for arg in "$@"; do
  case $arg in
    --suite=*)
      SUITE="${arg#*=}"
      ;;
    --smoke)
      SMOKE_ONLY=true
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

FAILED=()

run_api() {
  local script
  if $SMOKE_ONLY; then
    script="yarn workspace @todos/api test:e2e:smoke --reporter=junit --outputFile=${REPORTS_DIR}/junit-api.xml"
  else
    script="yarn workspace @todos/api test:e2e --reporter=junit --outputFile=${REPORTS_DIR}/junit-api.xml"
  fi
  echo "==> api e2e"
  (cd "${REPO_ROOT}" && eval "${script}") || FAILED+=("api")
}

run_mcp() {
  local script
  if $SMOKE_ONLY; then
    script="yarn workspace @todos/mcp test:e2e:smoke --reporter=junit --outputFile=${REPORTS_DIR}/junit-mcp.xml"
  else
    script="yarn workspace @todos/mcp test:e2e --reporter=junit --outputFile=${REPORTS_DIR}/junit-mcp.xml"
  fi
  echo "==> mcp e2e"
  (cd "${REPO_ROOT}" && eval "${script}") || FAILED+=("mcp")
}

run_web() {
  echo "⚠  web e2e requires Playwright — skipping until installed (see ADR 0025)."
}

run_mobile() {
  echo "⚠  mobile e2e requires Maestro CLI — skipping until installed (see ADR 0025)."
}

case $SUITE in
  api)    run_api ;;
  mcp)    run_mcp ;;
  web)    run_web ;;
  mobile) run_mobile ;;
  all)
    run_api
    run_mcp
    run_web
    run_mobile
    ;;
  *)
    echo "Unknown suite: ${SUITE}" >&2
    exit 1
    ;;
esac

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "✗ The following e2e suites FAILED: ${FAILED[*]}"
  exit 1
fi

echo "✓ All selected e2e suites passed."

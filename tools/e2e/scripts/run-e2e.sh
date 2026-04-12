#!/usr/bin/env bash
# tools/e2e/scripts/run-e2e.sh
#
# Local developer e2e runner — runs all app e2e suites in sequence.
#
# Prerequisites:
#   - Docker and Docker Compose v2 installed (for Firebase emulator)
#   - yarn installed and workspace dependencies installed
#
# Usage:
#   ./tools/e2e/scripts/run-e2e.sh [--suite=<api|mcp|web|mobile|all>] [--smoke]
#
# Options:
#   --suite=<name>  Run only the specified app suite (default: all)
#   --smoke         Run only smoke tests (skips full journey suites)
#
# Exit codes:
#   0 — all selected suites passed
#   1 — one or more suites failed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/../env/docker-compose.e2e.yml"

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

echo "==> Starting Firebase emulator..."
docker compose -f "${COMPOSE_FILE}" up -d firebase-emulator
echo "==> Waiting for Firebase emulator to be healthy..."
timeout 60 bash -c "until curl -sf http://localhost:4000; do sleep 2; done"

run_suite() {
  local name="$1"
  local script="$2"
  echo ""
  echo "==> Running e2e suite: ${name}"
  (cd "${REPO_ROOT}" && eval "${script}") && echo "✓ ${name} passed" || { echo "✗ ${name} failed"; return 1; }
}

FAILED=()

run_api() {
  if $SMOKE_ONLY; then
    run_suite "api:smoke" "yarn workspace @todos/api test:e2e:smoke" || FAILED+=("api")
  else
    run_suite "api" "yarn workspace @todos/api test:e2e" || FAILED+=("api")
  fi
}

run_mcp() {
  if $SMOKE_ONLY; then
    run_suite "mcp:smoke" "yarn workspace @todos/mcp test:e2e:smoke" || FAILED+=("mcp")
  else
    run_suite "mcp" "yarn workspace @todos/mcp test:e2e" || FAILED+=("mcp")
  fi
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

echo ""
echo "==> Tearing down emulator..."
docker compose -f "${COMPOSE_FILE}" down

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "✗ The following suites FAILED: ${FAILED[*]}"
  exit 1
fi

echo ""
echo "✓ All selected e2e suites passed."

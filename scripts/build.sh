#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ARTIFACTS_DIR="${PROJECT_ROOT}/artifacts"
ANGULAR_DIST="${PROJECT_ROOT}/dist/pandadoc"
CREATIO_DIR="${PROJECT_ROOT}/creatio"
PDC_JS_TARGET="${CREATIO_DIR}/PdcPandaDoc/Files/src/js/pandadoc"

# Parse arguments
SKIP_TEST=false
SKIP_PACK=false
VERSION=""

usage() {
  echo "Usage: $0 [--skip-test] [--skip-pack] [--version X.Y.Z]"
  echo ""
  echo "Builds the Angular component and packages Creatio packages using clio."
  echo ""
  echo "Options:"
  echo "  --version V   Version label for the output zip (e.g. 1.2.0)"
  echo "  --skip-test   Skip running tests"
  echo "  --skip-pack   Skip clio packaging (only build Angular and copy output)"
  echo "  -h, --help    Show this help message"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-test) SKIP_TEST=true; shift ;;
    --skip-pack) SKIP_PACK=true; shift ;;
    --version) VERSION="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

cd "$PROJECT_ROOT"

echo "=== Step 1: Install npm dependencies ==="
npm ci

if [ "$SKIP_TEST" = false ]; then
  echo ""
  echo "=== Step 2: Run tests ==="
  npm test -- --ci
else
  echo ""
  echo "=== Step 2: Skipping tests (--skip-test) ==="
fi

echo ""
echo "=== Step 3: Build Angular app ==="
# Use npx ng build to skip the postbuild hook (which requires config.json
# pointing to a local Creatio instance)
npx ng build

echo ""
echo "=== Step 4: Copy Angular output to PdcPandaDoc package ==="
if [ ! -d "$ANGULAR_DIST" ]; then
  echo "ERROR: Angular build output not found at $ANGULAR_DIST"
  exit 1
fi

mkdir -p "$PDC_JS_TARGET"
rm -rf "${PDC_JS_TARGET:?}"/*
cp -r "$ANGULAR_DIST"/* "$PDC_JS_TARGET/"
echo "Copied dist/pandadoc/ -> creatio/PdcPandaDoc/Files/src/js/pandadoc/"

if [ "$SKIP_PACK" = false ]; then
  echo ""
  echo "=== Step 5: Pack Creatio packages with clio ==="

  if ! command -v clio &>/dev/null; then
    echo "ERROR: clio not found."
    echo "Install it with: dotnet tool install clio -g"
    echo "Requires .NET SDK: https://dotnet.microsoft.com/download"
    exit 1
  fi

  mkdir -p "$ARTIFACTS_DIR"

  echo "Packing PdcPandaDoc..."
  clio generate-pkg-zip "${CREATIO_DIR}/PdcPandaDoc" -d "${ARTIFACTS_DIR}/PdcPandaDoc.gz"

  echo "Packing PdcCustomer360..."
  clio generate-pkg-zip "${CREATIO_DIR}/PdcCustomer360" -d "${ARTIFACTS_DIR}/PdcCustomer360.gz"

  echo "Packing PdcLeadOpportunity..."
  clio generate-pkg-zip "${CREATIO_DIR}/PdcLeadOpportunity" -d "${ARTIFACTS_DIR}/PdcLeadOpportunity.gz"

  echo ""
  echo "=== Step 6: Bundle all packages into a single zip ==="
  if [ -n "$VERSION" ]; then
    ZIP_NAME="PdcPandaDoc-packages-${VERSION}.zip"
  else
    ZIP_NAME="PdcPandaDoc-packages.zip"
  fi
  ZIP_PATH="${ARTIFACTS_DIR}/${ZIP_NAME}"
  rm -f "$ZIP_PATH"
  if command -v zip &>/dev/null; then
    (cd "$ARTIFACTS_DIR" && zip "$ZIP_NAME" *.gz)
  else
    WIN_ZIP="$(cygpath -w "$ZIP_PATH")"
    WIN_ARTIFACTS="$(cygpath -w "$ARTIFACTS_DIR")"
    powershell.exe -NoProfile -Command \
      "Compress-Archive -Path '${WIN_ARTIFACTS}\*.gz' -DestinationPath '${WIN_ZIP}'"
  fi
  echo ""
  echo "=== Artifacts in $ARTIFACTS_DIR/ ==="
  ls -la "$ARTIFACTS_DIR/"
else
  echo ""
  echo "=== Step 5: Skipping clio packaging (--skip-pack) ==="
fi

echo ""
echo "=== Build complete ==="

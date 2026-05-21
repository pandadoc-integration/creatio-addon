#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SDK_PATH="${PROJECT_ROOT}/src/app/view-elements/pandadoc/sdk.js"

usage() {
  echo "Usage: $0 <sdk-url> [version-label]"
  echo ""
  echo "Downloads a new PandaDoc JS SDK and replaces the current sdk.js."
  echo ""
  echo "Arguments:"
  echo "  sdk-url        Direct URL to the new sdk.js file (required)"
  echo "  version-label  Version label for reference, e.g. 0.5.0 (optional)"
  echo ""
  echo "Example:"
  echo "  $0 https://example.com/pandadoc-js-sdk-0.5.0.js 0.5.0"
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

SDK_URL="$1"
VERSION_LABEL="${2:-}"

# Backup current SDK
if [ -f "$SDK_PATH" ]; then
  cp "$SDK_PATH" "${SDK_PATH}.bak"
  echo "Backed up current SDK to sdk.js.bak"
fi

# Download new SDK
echo "Downloading SDK from: $SDK_URL"
if command -v curl &>/dev/null; then
  curl -fSL "$SDK_URL" -o "$SDK_PATH"
elif command -v wget &>/dev/null; then
  wget -q "$SDK_URL" -O "$SDK_PATH"
else
  echo "ERROR: Neither curl nor wget found. Cannot download SDK."
  exit 1
fi

# Validate the downloaded file
if [ ! -s "$SDK_PATH" ]; then
  echo "ERROR: Downloaded file is empty."
  if [ -f "${SDK_PATH}.bak" ]; then
    mv "${SDK_PATH}.bak" "$SDK_PATH"
    echo "Restored previous SDK from backup."
  fi
  exit 1
fi

# Basic sanity check: file should contain JavaScript-like content
if ! head -c 100 "$SDK_PATH" | grep -qE '[/*(a-zA-Z]'; then
  echo "WARNING: Downloaded file may not be valid JavaScript."
  echo "First 100 bytes:"
  head -c 100 "$SDK_PATH"
  echo ""
fi

# Print version header (typically the first line comment)
echo ""
echo "=== SDK Header ==="
head -3 "$SDK_PATH"
echo ""

if [ -n "$VERSION_LABEL" ]; then
  echo "SDK updated to version: $VERSION_LABEL"
else
  echo "SDK updated successfully."
fi

echo "Path: $SDK_PATH"

# Clean up backup
if [ -f "${SDK_PATH}.bak" ]; then
  rm "${SDK_PATH}.bak"
fi

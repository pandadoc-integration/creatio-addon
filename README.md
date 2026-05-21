# PandaDoc Custom Component

This project provides custom UI components for FreedomUI integration with PandaDoc.

## Prerequisites

- Node.js (v16.17.0 or higher)
- Angular CLI

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/experceo/pandadoc.git
   cd pandadoc
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the project:
   Copy `config.example.json` to `config.json` and update the Creatio instance path and package name as needed.

## Local Development

Build the project and deploy to your local Creatio instance:

```bash
npm run build
```

This compiles the Angular application and runs the post-build script that copies the built files to your Creatio instance's package directory (configured in `config.json`).

## Build & Package (CI/CD)

Build scripts automate the full pipeline: build the Angular component, assemble the Creatio packages, and pack them into `.gz` archives using [clio](https://github.com/Advance-Technologies-Foundation/clio).

### Prerequisites

- Node.js (v16.17.0+)
- .NET SDK 8.0+ (for clio)
- clio: `dotnet tool install clio -g`

### Full Build

```bash
bash scripts/build.sh --version 1.0.0
```

This runs the following steps:

1. `npm ci` — install dependencies
2. `npm test` — run tests
3. `npx ng build` — build the Angular app
4. Copy `dist/pandadoc/` into `creatio/PdcPandaDoc/Files/src/js/pandadoc/`
5. `clio generate-pkg-zip` — pack each Creatio package into a `.gz` file
6. Bundle all `.gz` files into `PdcPandaDoc-packages-1.0.0.zip`

Output is written to the `artifacts/` directory.

### Options

| Flag | Description |
|------|-------------|
| `--version X.Y.Z` | Version label included in the output zip filename |
| `--skip-test` | Skip running tests |
| `--skip-pack` | Skip clio packaging (only build Angular and copy output) |

### Examples

```bash
# Full build + package with version
bash scripts/build.sh --version 1.2.0

# Quick build without tests or packaging (for iteration)
bash scripts/build.sh --skip-test --skip-pack

# Build + package, skip tests
bash scripts/build.sh --skip-test --version 1.0.0
```

### Update PandaDoc SDK

To update the PandaDoc JS SDK to a new version:

```bash
bash scripts/update-sdk.sh <sdk-url> [version-label]
```

Example:

```bash
bash scripts/update-sdk.sh https://example.com/pandadoc-js-sdk-0.5.0.js 0.5.0
```

This downloads the new SDK, replaces `src/app/view-elements/pandadoc/sdk.js`, and prints the version header for confirmation. Run `scripts/build.sh` afterwards to rebuild with the new SDK.

### Deploy to Creatio

The build script produces `.gz` packages that can be installed to a Creatio instance using clio:

```bash
# Register your Creatio environment
clio reg-web-app my-env -u https://myinstance.creatio.com -l admin -p password

# Install packages (in dependency order)
clio push-pkg artifacts/PdcPandaDoc.gz -e my-env
clio push-pkg artifacts/PdcCustomer360.gz -e my-env
clio push-pkg artifacts/PdcLeadOpportunity.gz -e my-env
```

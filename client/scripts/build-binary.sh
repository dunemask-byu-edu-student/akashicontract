#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Configurable variables
CLIENT_NAME="akcc" # akashicontract-client
BUILD_DIR="build"
SEA_CONFIG="sea-config.json"
ROLLDOWN_CONFIG="rolldown.config.ts"
SEA_FUSE="NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2"

# Define paths to commands
ROLLDOWN="./node_modules/.bin/rolldown"
POSTJECT="./node_modules/.bin/postject"
ESBUILD="./node_modules/.bin/esbuild"
TSC_ALIAS="./node_modules/.bin/tsc-alias"

echo "Transpiling to JavaScript"

# Collect .ts files with find
TS_FILES=$(find src -name '*.ts')

# Run esbuild with all files at once using xargs
# Using `xargs` to handle spaces/newlines robustly
echo "$TS_FILES" | xargs "$ESBUILD" --tsconfig=tsconfig.json --outdir="$BUILD_DIR/client"
"$TSC_ALIAS" -p tsconfig.json "$BUILD_DIR/client"

echo "Running rolldown with config: $ROLLDOWN_CONFIG"
"$ROLLDOWN" -c "$ROLLDOWN_CONFIG"

echo "Running node with experimental sea config: $SEA_CONFIG"
node --experimental-sea-config "$SEA_CONFIG"

echo "Copying node binary to $BUILD_DIR/$CLIENT_NAME"
cp "$(command -v node)" "$BUILD_DIR/$CLIENT_NAME"

echo "Running postject to generate blob: $BUILD_DIR/client.blob"
"$POSTJECT" "$BUILD_DIR/$CLIENT_NAME" NODE_SEA_BLOB "$BUILD_DIR/client.blob" --sentinel-fuse "$SEA_FUSE"

echo "Build process completed successfully!"

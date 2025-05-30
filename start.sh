#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f "$(dirname "$0")/.env" ]; then
    set -a  # Export all variables
    source "$(dirname "$0")/.env"
    set +a
fi

# Determine Node.js binary to use
# Priority: NODE_PATH env var > nvm default > system node
if [ -n "$NODE_PATH" ]; then
    # Use NODE_PATH from .env file
    NODE_BIN="$NODE_PATH"
elif command -v node >/dev/null 2>&1; then
    # Use system node
    NODE_BIN="node"
else
    echo "Error: Node.js not found. Please install Node.js 18+ or set NODE_PATH in .env file" >&2
    exit 1
fi

# Verify Node.js version (must be 18+)
NODE_VERSION=$("$NODE_BIN" --version 2>/dev/null | grep -oE '[0-9]+' | head -1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ required. Current version: $("$NODE_BIN" --version 2>/dev/null || echo 'unknown')" >&2
    echo "Please install Node.js 18+ or set NODE_PATH in .env to point to a compatible version" >&2
    exit 1
fi

# Start the server
exec "$NODE_BIN" "$(dirname "$0")/build/index.js"
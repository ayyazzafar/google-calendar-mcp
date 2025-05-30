#!/bin/bash

# Load environment variables from .env file
export $(cat "$(dirname "$0")/.env" | xargs)

# Start the server
exec node "$(dirname "$0")/build/index.js"
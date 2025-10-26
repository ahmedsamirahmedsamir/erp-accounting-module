#!/bin/bash

set -e

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Accounting Module Plugin...${NC}"

# Determine platform-specific extension
case "$(uname -s)" in
    Linux*)     EXT=".so";;
    Darwin*)    EXT=".dylib";;
    MINGW*|MSYS*|CYGWIN*) EXT=".dll";;
    *)          EXT=".so";;
esac

# Go to handlers directory
cd handlers

# Build the plugin
echo -e "${YELLOW}Compiling plugin for $(uname -s)...${NC}"
go build -buildmode=plugin -o ../accounting${EXT} *.go

echo -e "${GREEN}✓ Plugin built successfully: accounting${EXT}${NC}"


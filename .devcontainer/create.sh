#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Installing bun!${NC}"
echo ""
npm install -g bun

echo -e "${GREEN}Installing cloud native buildpacks tool: Pack CLI!${NC}"
echo ""
(curl -sSL "https://github.com/buildpacks/pack/releases/download/v0.37.0/pack-v0.37.0-linux.tgz" | sudo tar -C /usr/local/bin/ --no-same-owner -xzv pack)

echo -e "${GREEN}Installing global tools!${NC}"
echo ""

bun add -g typescript nodemon tsx @types/node

echo -e "${BLUE}Setting git config!${NC}"
echo ""
git config --global init.defaultBranch main

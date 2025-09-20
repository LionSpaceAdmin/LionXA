#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Disable npm warnings
export npm_config_verify_deps_before_run=false
export npm_config__jsr_registry=false

echo -e "\n${YELLOW}🔧 Playwright Environment Setup${NC}\n"

# וודא שיש Node.js ו-pnpm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm...${NC}"
    npm install -g pnpm
fi

# הרץ את סקריפט הבדיקה
echo -e "${YELLOW}🔍 Running environment validation...${NC}"
npx ts-node src/setup/validatePlaywright.ts

# בדוק את תוצאת ההרצה
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Setup completed successfully${NC}"
else
    echo -e "\n${RED}⚠️ Setup completed with warnings${NC}"
    echo "Please address any issues shown above"
fi

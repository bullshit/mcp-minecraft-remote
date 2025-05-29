#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 MCP Minecraft Dev Container Ready!${NC}"
echo ""

# Check if Minecraft server is running
if docker compose ps server --status running >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Minecraft server is running${NC}"
elif docker compose ps --services | grep -q server; then
    echo -e "${YELLOW}⏳ Minecraft server is stopped. Use 'mc-start' to start it.${NC}"
else
    echo -e "${YELLOW}💡 Use 'mc-start' to start the Minecraft server${NC}"
fi

echo ""
echo -e "${BLUE}Available commands:${NC}"
echo -e "  ${YELLOW}bun start${NC}          - Start the MCP server"
echo -e "  ${YELLOW}bun run build${NC}      - Build TypeScript"
echo -e "  ${YELLOW}bun run dev${NC}        - Start with hot reload"
echo -e "  ${YELLOW}bun run debug${NC}      - Start with debugger"
echo ""
echo -e "${BLUE}Minecraft server commands:${NC}"
echo -e "  ${YELLOW}mc-start${NC}           - Start Minecraft server"
echo -e "  ${YELLOW}mc-stop${NC}            - Stop Minecraft server"
echo -e "  ${YELLOW}mc-restart${NC}         - Restart Minecraft server"
echo -e "  ${YELLOW}mc-logs${NC}            - View Minecraft server logs"
echo -e "  ${YELLOW}mc-rcon <command>${NC}  - Send RCON command to server"
echo ""
echo -e "${BLUE}Ports:${NC}"
echo -e "  🎮 Minecraft server: ${YELLOW}25565${NC}"
echo -e "  🔗 MCP server: ${YELLOW}3000${NC}"
echo -e "  🛠️  RCON: ${YELLOW}25575${NC}"
echo -e "  🗣️  Voice chat: ${YELLOW}24454${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🎯${NC}"

# Create helpful aliases
cat > ~/.bash_aliases << 'EOF'
# Minecraft server management
alias mc-start='docker compose up -d server'
alias mc-stop='docker compose stop server'
alias mc-restart='docker compose restart server'
alias mc-logs='docker compose logs -f server'
alias mc-status='docker compose ps server'

# RCON function
mc-rcon() {
    if [ -z "$1" ]; then
        echo "Usage: mc-rcon <command>"
        echo "Example: mc-rcon 'list'"
        return 1
    fi
    # Connect to RCON on localhost since server runs on host
    docker run --rm -it --network host itzg/mc-rcon rcon --host localhost --port 25575 --password ${RCON_PASSWORD:-minecraft} "$1"
}

# Development shortcuts
alias dev='bun run dev'
alias build='bun run build'
alias debug='bun run debug'
EOF

source ~/.bash_aliases
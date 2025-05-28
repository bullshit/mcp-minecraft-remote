#!/usr/bin/env node
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { server } from './server.js'
import { registerAllTools } from './tools/index.js'
import { IncomingMessage, ServerResponse } from "node:http";
import express from "express";

let transport: SSEServerTransport | null = null;
const app = express();

// Register all tools
registerAllTools()

app.get("/sse", (eq: IncomingMessage, res: ServerResponse) => {
  console.info('Client connection started');
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

app.post("/messages", (req: IncomingMessage, res: ServerResponse,) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

console.info('MCP Minecraft Remote Server running on :3000')
app.listen(3000);

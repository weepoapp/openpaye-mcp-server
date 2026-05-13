#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";
import { startHttpTransport } from "./transports/http.js";

function logToStderr(scope: string, err: unknown): void {
  const msg =
    err instanceof Error
      ? (typeof err.stack === "string" && err.stack.length > 0 ? err.stack : err.message)
      : String(err);
  console.error(`[openpaye-mcp-server] ${scope}: ${msg}`);
}

process.on("uncaughtException", (error) => {
  logToStderr("uncaughtException", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logToStderr("unhandledRejection", reason);
});

async function main(): Promise<void> {
  const transportMode = (process.env.MCP_TRANSPORT ?? "stdio").toLowerCase();

  if (transportMode === "http" || transportMode === "streamable-http") {
    await startHttpTransport();
    return;
  }

  const server = createMcpServer();
  const stdioTransport = new StdioServerTransport();
  await server.connect(stdioTransport);
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`Failed to start openpaye-mcp-server: ${message}`);
  process.exit(1);
});

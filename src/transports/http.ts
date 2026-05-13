import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../server.js";

interface HttpConfig {
  host: string;
  port: number;
  path: string;
}

function getHttpConfig(): HttpConfig {
  return {
    host: process.env.MCP_HTTP_HOST ?? "127.0.0.1",
    port: Number(process.env.MCP_HTTP_PORT ?? 3000),
    path: process.env.MCP_HTTP_PATH ?? "/mcp",
  };
}

export async function startHttpTransport(): Promise<void> {
  const config = getHttpConfig();

  const server = createServer(async (req, res) => {
    if (!req.url || !req.url.startsWith(config.path)) {
      res.writeHead(404).end("Not found");
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405).end("Method not allowed");
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("error", () => {
      res.writeHead(400).end("Invalid body stream");
    });

    req.on("end", async () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      const parsedBody = raw ? JSON.parse(raw) : undefined;

      const mcpServer = createMcpServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

      try {
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res, parsedBody);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32603, message } }));
        }
      } finally {
        await transport.close();
        await mcpServer.close();
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, () => resolve());
  });
}

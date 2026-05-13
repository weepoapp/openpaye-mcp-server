import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OpenPayeClient } from "../services/openpaye-client.js";

export interface CrudFactoryOptions {
  toolPrefix: string;
  endpoint: string;
  supportsDelete?: boolean;
}

export function registerCrudTools(server: McpServer, client: OpenPayeClient, options: CrudFactoryOptions): void {
  const { toolPrefix, endpoint, supportsDelete = true } = options;

  server.registerTool(
    `${toolPrefix}_list`,
    {
      description: `List ${toolPrefix}`,
      inputSchema: { query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional() },
    },
    async ({ query }) => toText(await client.request({ method: "GET", path: endpoint, query })),
  );

  server.registerTool(
    `${toolPrefix}_get`,
    {
      description: `Get one ${toolPrefix} by id`,
      inputSchema: { id: z.number().int().positive() },
    },
    async ({ id }) => toText(await client.request({ method: "GET", path: `${endpoint}/${id}` })),
  );

  server.registerTool(
    `${toolPrefix}_create`,
    {
      description: `Create one ${toolPrefix}`,
      inputSchema: { body: z.unknown() },
    },
    async ({ body }) => toText(await client.request({ method: "POST", path: endpoint, body })),
  );

  server.registerTool(
    `${toolPrefix}_update`,
    {
      description: `Update one ${toolPrefix}`,
      inputSchema: { body: z.unknown() },
    },
    async ({ body }) => toText(await client.request({ method: "PUT", path: endpoint, body })),
  );

  if (supportsDelete) {
    server.registerTool(
      `${toolPrefix}_delete`,
      {
        description: `Delete one ${toolPrefix} by id`,
        inputSchema: { id: z.number().int().positive() },
      },
      async ({ id }) => toText(await client.request({ method: "DELETE", path: `${endpoint}/${id}` })),
    );
  }
}

function toText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: { data },
  };
}

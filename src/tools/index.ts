import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OPENPAYE_ENDPOINT_TOOLS } from "../constants.js";
import { ENDPOINT_DESCRIPTIONS, ENDPOINT_INPUT_SCHEMAS } from "../schemas/endpoint-inputs.js";
import { OpenPayeClient } from "../services/openpaye-client.js";
import { buildOpenPayeRequest } from "./build-request.js";

function asText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: { data },
  };
}

function fallbackInputSchema(endpoint: (typeof OPENPAYE_ENDPOINT_TOOLS)[number]): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (endpoint.hasIdParam) {
    shape.id = z.number().int().positive();
  }

  if (endpoint.method === "GET") {
    shape.query = z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional()
      .describe("Parametres query legacy (preferer les champs explicites du schema)");
  }

  if (endpoint.method === "POST" || endpoint.method === "PUT") {
    shape.body = z.unknown();
  }

  return shape;
}

export function registerTools(server: McpServer, client: OpenPayeClient): void {
  for (const endpoint of OPENPAYE_ENDPOINT_TOOLS) {
    const inputSchema =
      ENDPOINT_INPUT_SCHEMAS[endpoint.toolName] ?? fallbackInputSchema(endpoint);

    const description = ENDPOINT_DESCRIPTIONS[endpoint.toolName] ?? endpoint.description;

    server.registerTool(
      endpoint.toolName,
      {
        description,
        inputSchema,
      },
      async (input) => {
        const args = input as Record<string, unknown>;
        const request = buildOpenPayeRequest(endpoint, args);
        return asText(await client.request(request));
      },
    );
  }
}

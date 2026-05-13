import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { OPENPAYE_ENDPOINT_TOOLS } from "../constants.js";
import { OpenPayeClient } from "../services/openpaye-client.js";

function asText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: { data },
  };
}

export function registerTools(server: McpServer, client: OpenPayeClient): void {
  for (const endpoint of OPENPAYE_ENDPOINT_TOOLS) {
    const shape: Record<string, z.ZodTypeAny> = {};

    if (endpoint.hasIdParam) {
      shape.id = z.number().int().positive();
    }

    if (endpoint.queryKeys && endpoint.queryKeys.length > 0) {
      shape.query = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional();
    } else if (endpoint.method === "GET") {
      shape.query = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional();
    }

    if (endpoint.method === "POST" || endpoint.method === "PUT") {
      shape.body = z.unknown();
    }

    server.registerTool(
      endpoint.toolName,
      {
        description: endpoint.description,
        inputSchema: shape,
      },
      async (input) => {
        const args = input as Record<string, unknown>;
        const inputQuery =
          typeof args.query === "object" && args.query !== null ? (args.query as Record<string, unknown>) : undefined;

        const endpointPath =
          endpoint.hasIdParam && typeof args.id === "number"
            ? endpoint.path.replace("{id}", String(args.id))
            : endpoint.path;

        const endpointPathWithSiret =
          endpoint.path.includes("{siret}") && inputQuery && "siret" in inputQuery
            ? endpointPath.replace("{siret}", String(inputQuery.siret))
            : endpointPath;

        const query = inputQuery ? { ...inputQuery } : undefined;
        if (query && "siret" in query) {
          delete query.siret;
        }

        return asText(
          await client.request({
            method: endpoint.method,
            path: endpointPathWithSiret,
            query: query as Record<string, string | number | boolean> | undefined,
            body: "body" in args ? args.body : undefined,
          }),
        );
      },
    );
  }
}

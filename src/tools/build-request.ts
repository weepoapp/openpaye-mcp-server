import { EndpointToolDefinition } from "../constants.js";
import { ENDPOINT_INPUT_SCHEMAS } from "../schemas/endpoint-inputs.js";
import { OpenPayeRequestInput } from "../types.js";

const RESERVED_INPUT_KEYS = new Set(["query", "body", "id", "siret"]);

export function buildOpenPayeRequest(
  endpoint: EndpointToolDefinition,
  args: Record<string, unknown>,
): OpenPayeRequestInput {
  const schema = ENDPOINT_INPUT_SCHEMAS[endpoint.toolName];
  const query: Record<string, unknown> = {};

  if (typeof args.query === "object" && args.query !== null) {
    Object.assign(query, args.query as Record<string, unknown>);
  }

  if (schema) {
    for (const key of Object.keys(schema)) {
      if (RESERVED_INPUT_KEYS.has(key)) {
        continue;
      }
      if (args[key] !== undefined) {
        query[key] = args[key];
      }
    }
  }

  let path = endpoint.path;

  if (endpoint.hasIdParam && typeof args.id === "number") {
    path = path.replace("{id}", String(args.id));
  }

  if (path.includes("{siret}")) {
    const siret = args.siret ?? query.siret;
    if (siret !== undefined) {
      path = path.replace("{siret}", String(siret));
    }
    delete query.siret;
  }

  const normalizedQuery =
    Object.keys(query).length > 0
      ? (query as Record<string, string | number | boolean>)
      : undefined;

  return {
    method: endpoint.method,
    path,
    query: normalizedQuery,
    body: "body" in args ? args.body : undefined,
  };
}

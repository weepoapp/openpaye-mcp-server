import { EndpointToolDefinition } from "../constants.js";
import { ENDPOINT_INPUT_SCHEMAS } from "../schemas/endpoint-inputs.js";
import { OpenPayeRequestInput } from "../types.js";

const RESERVED_INPUT_KEYS = new Set(["query", "body", "id", "siret"]);

/** Parametres query explicites (le reste va dans le body pour POST/PUT). */
const QUERY_PARAM_KEYS = new Set([
  "contratId",
  "dossierId",
  "page",
  "codeDossier",
  "matricule",
  "numeroContrat",
  "codeEtablissement",
  "type",
  "nomVariable",
  "variableARecuperer",
  "contratid",
  "format",
  "mois",
  "annee",
  "moisDebut",
  "moisFin",
  "anneeDebut",
  "anneeFin",
  "inclureDocumentDeSortie",
  "valeur",
]);

function isQueryKey(method: EndpointToolDefinition["method"], key: string): boolean {
  if (method === "GET" || method === "DELETE") {
    return !RESERVED_INPUT_KEYS.has(key);
  }
  return QUERY_PARAM_KEYS.has(key);
}

function buildBody(
  endpoint: EndpointToolDefinition,
  schema: Record<string, unknown> | undefined,
  args: Record<string, unknown>,
): unknown {
  const body: Record<string, unknown> = {};

  if (typeof args.body === "object" && args.body !== null) {
    Object.assign(body, args.body as Record<string, unknown>);
  }

  if (schema && (endpoint.method === "POST" || endpoint.method === "PUT")) {
    for (const key of Object.keys(schema)) {
      if (RESERVED_INPUT_KEYS.has(key) || isQueryKey(endpoint.method, key)) {
        continue;
      }
      if (args[key] !== undefined) {
        body[key] = args[key];
      }
    }
  }

  return Object.keys(body).length > 0 ? body : undefined;
}

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
      if (!isQueryKey(endpoint.method, key)) {
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
    body: buildBody(endpoint, schema, args),
  };
}

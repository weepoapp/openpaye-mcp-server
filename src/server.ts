import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./prompts/index.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { OpenPayeClient } from "./services/openpaye-client.js";
import { registerTools } from "./tools/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    { capabilities: { logging: {}, tools: {} } },
  );

  const client = new OpenPayeClient();
  registerTools(server, client);
  registerPrompts(server);

  server.registerResource(
    "openpaye-docs",
    "openpaye://docs/access-api",
    {
      title: "OpenPaye API Access",
      description: "Authentication and base URL reminders",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "openpaye://docs/access-api",
          text: JSON.stringify(
            {
              documentationUrl: "https://www.openpaye.co/docs/acces-api",
              baseUrl: process.env.OPENPAYE_BASE_URL ?? "https://api.openpaye.co",
              auth: "Basic Auth",
              credentialsHint:
                "Identifiant et cle API : compte admin OpenPaye → dossiers de paie → Parametres → Acces API (voir documentationUrl).",
              apiPathsNote:
                "Les chemins API sont en minuscules (/bulletinspaies, /editions, /variables). Les bulletins exigent codeDossier + matricule + numeroContrat ou codeDossier + annee + mois. Les variables utilisent dossierId (id numerique), pas codeDossier.",
              workflowHint:
                "Ordre typique : dossiers_list → salaries_list (dossierId) → contrats_list (dossierId) → bulletinspaies_by_periode ou bulletinspaies_list.",
              requiredEnv: ["OPENPAYE_API_USER", "OPENPAYE_API_KEY"],
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  return server;
}

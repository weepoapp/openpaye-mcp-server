export const SERVER_NAME = "openpaye-mcp-server";
export const SERVER_VERSION = "0.1.0";

export const DEFAULT_BASE_URL = "https://api.openpaye.co";
export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

export const OPENPAYE_ENDPOINTS = {
  absences: "/Abcenses",
  bulletinsPaies: "/bulletinspaies",
  caisseCotisations: "/CaisseCotisations",
  contrats: "/contrats",
  contratSortant: "/ContratSortant",
  dossiers: "/dossiers",
  dsns: "/DSNs",
  editions: "/editions",
  etablissements: "/etablissements",
  heuresSupplementaires: "/HeuresSupplementaires",
  netEntreprise: "/NetEntreprise",
  options: "/Options",
  primes: "/Primes",
  salaries: "/salaries",
  soldeToutComptes: "/soldeToutcomptes",
  variables: "/variables",
  variablesBulletins: "/variablesbulletins",
  variablesRepriseDossier: "/VariablesRepriseDossier",
} as const;

export interface EndpointToolDefinition {
  toolName: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  hasIdParam?: boolean;
  queryKeys?: string[];
}

export const OPENPAYE_ENDPOINT_TOOLS: EndpointToolDefinition[] = [
  { toolName: "openpaye_absences_get", method: "GET", path: "/Abcenses/{id}", description: "Get one absence", hasIdParam: true },
  {
    toolName: "openpaye_absences_periode",
    method: "GET",
    path: "/Abcenses/periode",
    description: "List absences by period",
    queryKeys: ["contratId", "anneeDebut", "moisDebut", "anneeFin", "moisFin"],
  },
  { toolName: "openpaye_absences_update", method: "PUT", path: "/Abcenses", description: "Update an absence" },
  { toolName: "openpaye_absences_create", method: "POST", path: "/Abcenses", description: "Create an absence", queryKeys: ["contratId"] },
  { toolName: "openpaye_bulletinspaies_list", method: "GET", path: "/bulletinspaies", description: "List payroll slips" },
  { toolName: "openpaye_bulletinspaies_details", method: "GET", path: "/bulletinspaies/BulletinDetail", description: "Get payroll slip details" },
  { toolName: "openpaye_bulletinspaies_by_periode", method: "GET", path: "/bulletinspaies/listebulletinspaies", description: "List payroll slips by period" },
  { toolName: "openpaye_caisse_cotisations_get", method: "GET", path: "/CaisseCotisations/{id}", description: "Get one caisse cotisation", hasIdParam: true },
  { toolName: "openpaye_caisse_cotisations_create", method: "POST", path: "/CaisseCotisations", description: "Create caisse cotisation" },
  { toolName: "openpaye_contrats_list", method: "GET", path: "/contrats", description: "List contracts" },
  { toolName: "openpaye_contrats_update", method: "PUT", path: "/contrats", description: "Update contract" },
  { toolName: "openpaye_contrats_create", method: "POST", path: "/contrats", description: "Create contract" },
  { toolName: "openpaye_contrats_get", method: "GET", path: "/contrats/{id}", description: "Get contract", hasIdParam: true },
  { toolName: "openpaye_contrats_delete", method: "DELETE", path: "/contrats/{id}", description: "Delete contract", hasIdParam: true },
  { toolName: "openpaye_contrat_sortant", method: "GET", path: "/ContratSortant", description: "Get outgoing contracts" },
  { toolName: "openpaye_dossiers_list", method: "GET", path: "/dossiers", description: "List folders" },
  { toolName: "openpaye_dossiers_update", method: "PUT", path: "/dossiers", description: "Update folder" },
  { toolName: "openpaye_dossiers_create", method: "POST", path: "/dossiers", description: "Create folder" },
  { toolName: "openpaye_dossiers_get", method: "GET", path: "/dossiers/{id}", description: "Get folder", hasIdParam: true },
  { toolName: "openpaye_dossiers_delete", method: "DELETE", path: "/dossiers/{id}", description: "Delete folder", hasIdParam: true },
  { toolName: "openpaye_dossiers_by_siret", method: "GET", path: "/dossiers/siret/{siret}", description: "Get folder by SIRET", queryKeys: ["siret"] },
  { toolName: "openpaye_dsns_list", method: "GET", path: "/DSNs", description: "List DSN" },
  { toolName: "openpaye_editions_list", method: "GET", path: "/editions", description: "List editions" },
  { toolName: "openpaye_etablissements_list", method: "GET", path: "/etablissements", description: "List establishments" },
  { toolName: "openpaye_etablissements_update", method: "PUT", path: "/etablissements", description: "Update establishment" },
  { toolName: "openpaye_etablissements_create", method: "POST", path: "/etablissements", description: "Create establishment" },
  { toolName: "openpaye_etablissements_get", method: "GET", path: "/etablissements/{id}", description: "Get establishment", hasIdParam: true },
  { toolName: "openpaye_etablissements_delete", method: "DELETE", path: "/etablissements/{id}", description: "Delete establishment", hasIdParam: true },
  { toolName: "openpaye_heures_supp_update", method: "PUT", path: "/HeuresSupplementaires", description: "Update overtime hours" },
  { toolName: "openpaye_heures_supp_create", method: "POST", path: "/HeuresSupplementaires", description: "Create overtime hours" },
  { toolName: "openpaye_net_entreprise_update", method: "PUT", path: "/NetEntreprise", description: "Update net enterprise variables" },
  { toolName: "openpaye_net_entreprise_create", method: "POST", path: "/NetEntreprise", description: "Create net enterprise variables" },
  { toolName: "openpaye_options_update", method: "PUT", path: "/Options", description: "Update options" },
  { toolName: "openpaye_options_create", method: "POST", path: "/Options", description: "Create options" },
  { toolName: "openpaye_primes_update", method: "PUT", path: "/Primes", description: "Update bonus" },
  { toolName: "openpaye_primes_create", method: "POST", path: "/Primes", description: "Create bonus" },
  { toolName: "openpaye_salaries_list", method: "GET", path: "/salaries", description: "List employees" },
  { toolName: "openpaye_salaries_update", method: "PUT", path: "/salaries", description: "Update employee" },
  { toolName: "openpaye_salaries_create", method: "POST", path: "/salaries", description: "Create employee" },
  { toolName: "openpaye_salaries_get", method: "GET", path: "/salaries/{id}", description: "Get employee", hasIdParam: true },
  { toolName: "openpaye_salaries_delete", method: "DELETE", path: "/salaries/{id}", description: "Delete employee", hasIdParam: true },
  { toolName: "openpaye_solde_tout_compte", method: "GET", path: "/soldeToutcomptes", description: "List final settlements" },
  { toolName: "openpaye_variables_list", method: "GET", path: "/variables", description: "List variables" },
  { toolName: "openpaye_variables_bulletins", method: "GET", path: "/variablesbulletins", description: "List bulletin variables" },
  { toolName: "openpaye_compteurs_conges", method: "GET", path: "/variablesbulletins/CompteursConges", description: "Get paid leave counters" },
  { toolName: "openpaye_variables_reprise_list", method: "GET", path: "/VariablesRepriseDossier", description: "List takeover variables" },
  { toolName: "openpaye_variables_reprise_create", method: "POST", path: "/VariablesRepriseDossier", description: "Create takeover variable" },
];

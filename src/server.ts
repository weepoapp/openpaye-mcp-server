import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPrompts } from "./prompts/index.js";
import {
  DEFAULT_BASE_URL,
  OPENPAYE_API_VERSION,
  OPENPAYE_DOCS_URL,
  SERVER_NAME,
  SERVER_VERSION,
} from "./constants.js";
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
              apiVersion: OPENPAYE_API_VERSION,
              documentationUrl: "https://www.openpaye.co/docs/acces-api",
              redocUrl: OPENPAYE_DOCS_URL,
              baseUrl: process.env.OPENPAYE_BASE_URL ?? DEFAULT_BASE_URL,
              auth: "Basic Auth",
              credentialsHint:
                "Identifiant et cle API : compte admin OpenPaye → dossiers de paie → Parametres → Acces API (voir documentationUrl).",
              apiPathsNote:
                "API V2 (doc Redoc) : chemins sans prefixe de version (/dossiers, /bulletinspaies, /editions). Pas de /v2/ dans l'URL. Bulletins : codeDossier + matricule + numeroContrat ou codeDossier + annee + mois. Variables : dossierId (id numerique), pas codeDossier.",
              bulletinWorkflowHint:
                "Saisir d'abord les elements variables (openpaye_variables_saisir_*) puis GET bulletin — openpaye_bulletin_calculer ou openpaye_bulletin_generer. Doc : openpaye://docs/saisie-variables",
              workflowHint:
                "Ordre typique : dossiers_list → periode_ouvrir (verifier mois) → salaries/contrats → saisie variables → bulletin_generer. Doc periode : openpaye://docs/ouvrir-periode",
              requiredEnv: ["OPENPAYE_API_USER", "OPENPAYE_API_KEY"],
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "openpaye-docs-calcul-bulletin",
    "openpaye://docs/calcul-bulletin",
    {
      title: "Calcul et generation de bulletins (doc OpenPaye)",
      description:
        "Workflow officiel API V2 (Redoc) : pas de POST calculer — saisie variables puis GET bulletinspaies",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "openpaye://docs/calcul-bulletin",
          text: JSON.stringify(
            {
              sources: [
                "https://openpaye.redoc.ly/#tag/BulletinsPaies",
                "https://www.openpaye.co/docs/acces-api",
                "https://openpaye.co/docs/saisir-activite-partielle",
              ],
              apiVersion: OPENPAYE_API_VERSION,
              redocUrl: OPENPAYE_DOCS_URL,
              finding:
                "La section BulletinsPaies de l'API OpenPaye V2 (doc Redoc) ne contient que des GET. Il n'existe pas d'endpoint POST ou PUT « calculer » ou « generer » un bulletin. Le calcul est declenche implicitement lors de la recuperation du bulletin apres saisie des variables du mois.",
              uiAnalogy:
                "Dans l'interface OpenPaye (ex. activite partielle), on saisit d'abord les absences puis on « recalcule » le bulletin depuis le menu bulletin. Via API : POST/PUT des variables du mois, puis GET /bulletinspaies.",
              workflow: [
                {
                  step: 1,
                  action: "Identifier le dossier, salarie et contrat",
                  tools: ["openpaye_dossiers_list", "openpaye_salaries_list", "openpaye_contrats_list"],
                  notes: "codeDossier = code string du dossier ; contratId = id numerique du contrat.",
                },
                {
                  step: 2,
                  action: "Saisir ou mettre a jour les variables de paie du mois",
                  endpoints: [
                    { method: "POST", path: "/Abcenses", query: "contratId", body: "code, date_debut, date_fin, mois, annee, nbr_heure_by_user, nbr_jour_by_user" },
                    { method: "POST", path: "/Primes", query: "contratId", body: "code, montant, bases, tauxs, mois, annee" },
                    { method: "POST", path: "/HeuresSupplementaires", query: "contratId", body: "code, nombre, mois, annee" },
                    { method: "POST", path: "/Options", query: "contratId" },
                    { method: "POST", path: "/NetEntreprise", query: "dossierId" },
                    { method: "POST", path: "/VariablesRepriseDossier", query: "contratId, nomVariable, valeur" },
                  ],
                  tools: [
                    "openpaye_absences_create",
                    "openpaye_primes_create",
                    "openpaye_heures_supp_create",
                    "openpaye_options_create",
                    "openpaye_net_entreprise_create",
                    "openpaye_variables_reprise_create",
                  ],
                },
                {
                  step: 3,
                  action: "Calculer / obtenir le bulletin (GET — declenche le moteur de paie)",
                  options: [
                    {
                      cas: "Un salarie",
                      endpoint: "GET /bulletinspaies",
                      tool: "openpaye_bulletin_calculer",
                      alias: "openpaye_bulletinspaies_list",
                      params: [
                        "codeDossier",
                        "matricule",
                        "numeroContrat",
                        "moisDebut",
                        "moisFin",
                        "anneeDebut",
                        "anneeFin",
                        "inclureDocumentDeSortie (optionnel)",
                      ],
                    },
                    {
                      cas: "Tout le dossier pour un mois",
                      endpoint: "GET /bulletinspaies/listebulletinspaies",
                      tool: "openpaye_bulletin_generer",
                      alias: "openpaye_bulletinspaies_by_periode",
                      params: ["codeDossier", "annee", "mois", "page (optionnel)"],
                    },
                    {
                      cas: "Detail d'une ligne de bulletin",
                      endpoint: "GET /bulletinspaies/BulletinDetail",
                      tool: "openpaye_bulletinspaies_details",
                      params: ["contratid (minuscules)", "annee", "mois", "variableARecuperer"],
                    },
                    {
                      cas: "Variable calculee sur le bulletin",
                      endpoint: "GET /variablesbulletins",
                      tool: "openpaye_variables_bulletins",
                      params: ["contratId", "annee", "mois", "variableARecuperer"],
                    },
                  ],
                },
                {
                  step: 4,
                  action: "Export / edition (optionnel, apres calcul)",
                  endpoint: "GET /editions",
                  tool: "openpaye_editions_list",
                  params: ["codeDossier", "moisDebut", "moisFin", "annee", "format (PDF, Excel, …)"],
                },
              ],
              casParticulier: {
                soldeToutCompte: {
                  endpoint: "GET /soldeToutcomptes",
                  tool: "openpaye_solde_tout_compte",
                  params: ["codeDossier", "matricule", "numeroContrat"],
                  note: "Doc Redoc intitule aussi « Obtenir un bulletin de paie » pour le solde de tout compte.",
                },
              },
              exempleCalculUnSalarie: {
                tool: "openpaye_bulletin_calculer",
                params: {
                  codeDossier: "MONDOSSIER",
                  matricule: "001",
                  numeroContrat: "1",
                  moisDebut: 5,
                  moisFin: 5,
                  anneeDebut: 2026,
                  anneeFin: 2026,
                },
              },
              exempleGenererDossier: {
                tool: "openpaye_bulletin_generer",
                params: { codeDossier: "MONDOSSIER", annee: 2026, mois: 5 },
              },
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "openpaye-docs-saisie-variables",
    "openpaye://docs/saisie-variables",
    {
      title: "Saisie des elements variables de paie",
      description: "Absences, primes, heures sup, options — avant calcul bulletin",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "openpaye://docs/saisie-variables",
          text: JSON.stringify(
            {
              workflow:
                "1) contrats_list → contratId  2) saisir variables (tools saisir_*)  3) bulletin_calculer ou bulletin_generer",
              tools: {
                absence: {
                  tool: "openpaye_variables_saisir_absence",
                  endpoint: "POST /Abcenses?contratId=",
                  champs: ["code", "date_debut", "date_fin", "mois", "annee", "nbr_heure_by_user", "nbr_jour_by_user"],
                },
                prime: {
                  tool: "openpaye_variables_saisir_prime",
                  endpoint: "POST /Primes?contratId=",
                  champs: ["code", "montant", "bases", "tauxs", "mois", "annee", "ccn"],
                },
                heures_sup: {
                  tool: "openpaye_variables_saisir_heures_sup",
                  endpoint: "POST /HeuresSupplementaires?contratId=",
                  champs: ["code", "nombre", "mois", "annee"],
                },
                option: {
                  tool: "openpaye_variables_saisir_option",
                  endpoint: "POST /Options?contratId=",
                  champs: ["code", "valeur1", "valeur2", "valeur3", "actif1…8", "mois", "annee"],
                },
                reprise: {
                  tool: "openpaye_variables_saisir_reprise",
                  endpoint: "POST /VariablesRepriseDossier",
                  champs: ["contratId", "nomVariable", "valeur"],
                  note: "Tous les champs en query (pas de body).",
                },
                net_entreprise: {
                  tool: "openpaye_variables_saisir_net_entreprise",
                  endpoint: "POST /NetEntreprise?dossierId=",
                  champs: ["nom", "prenom", "siret", "email", "telephone", "mot_pass"],
                },
              },
              listerCodes: "openpaye_variables_list (dossierId + type + mois) — codes variables du dossier",
              prompt: "saisie_variables_paie",
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "openpaye-docs-ouvrir-periode",
    "openpaye://docs/ouvrir-periode",
    {
      title: "Ouvrir une periode de paie (OpenPaye)",
      description: "Interface et API : preparer un mois de paie avant saisie et bulletins",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "openpaye://docs/ouvrir-periode",
          text: JSON.stringify(
            {
              finding:
                "L'API OpenPaye V2 (Redoc) ne propose pas d'endpoint POST/PUT « ouvrir periode » ou « cloturer periode ». L'ouverture d'un mois se fait dans l'interface ou implicitement en ciblant mois/annee dans chaque appel API.",
              interfaceUtilisateur: {
                sources: [
                  "https://openpaye.co/docs/creer-un-dossier",
                  "https://openpaye.co/docs/saisir-activite-partielle",
                  "https://openpaye.co/docs/traitement-de-la-paie",
                ],
                etapes: [
                  "Se connecter a OpenPaye et ouvrir le domaine : Parametres → Mes domaines → Ouvrir domaine.",
                  "Ouvrir le dossier de paie concerne.",
                  "Aller au menu Bulletins et selectionner le mois a traiter (ex. mars 2026).",
                  "Verifier que le mois precedent est cloture/valide si votre processus interne l'exige (controles DSN, bulletins valides — voir editions et declarations).",
                  "Saisir les elements variables du mois (absences, primes, heures sup…) puis recalculer les bulletins.",
                ],
                noteAnneeDossier:
                  "A la creation du dossier, le champ annee fixe l'annee de debut des bulletins (non modifiable sans support OpenPaye). Voir openpaye.co/docs/creer-un-dossier.",
              },
              equivalentApi: {
                workflow: [
                  {
                    step: 1,
                    action: "Identifier le dossier",
                    tools: ["openpaye_dossiers_list", "openpaye_dossiers_get"],
                    note: "Recuperer id (dossierId) et code (codeDossier).",
                  },
                  {
                    step: 2,
                    action: "Verifier / preparer le mois (ouverture de periode cote API)",
                    tool: "openpaye_periode_ouvrir",
                    endpoint: "GET /variables?dossierId=&type=&mois=",
                    note: "Confirme que le dossier repond pour le mois cible. Parametre type : codes sur https://api.openpaye.co/",
                  },
                  {
                    step: 3,
                    action: "Lister salaries et contrats actifs",
                    tools: ["openpaye_salaries_list", "openpaye_contrats_list"],
                  },
                  {
                    step: 4,
                    action: "Saisir les elements variables du mois",
                    tools: [
                      "openpaye_variables_saisir_absence",
                      "openpaye_variables_saisir_prime",
                      "openpaye_variables_saisir_heures_sup",
                      "openpaye_variables_saisir_option",
                    ],
                    doc: "openpaye://docs/saisie-variables",
                  },
                  {
                    step: 5,
                    action: "Calculer les bulletins du mois ouvert",
                    tools: ["openpaye_bulletin_generer", "openpaye_bulletin_calculer"],
                    doc: "openpaye://docs/calcul-bulletin",
                  },
                ],
              },
              exempleVerifierPeriode: {
                tool: "openpaye_periode_ouvrir",
                params: { dossierId: 123, type: "Absence", mois: 5 },
                note: "annee n'est pas un query param de GET /variables ; le contexte annee est porte par le dossier et les appels bulletin (annee explicite).",
              },
              exempleBulletinApresOuverture: {
                tool: "openpaye_bulletin_generer",
                params: { codeDossier: "MONDOSSIER", annee: 2026, mois: 5 },
              },
              prompt: "ouvrir_periode_paie",
              casParticulierCongesPayes:
                "Reouverture periode CP (jours ouvres/ouvrables) : attendre le mois de reouverture (juin par defaut) et modifier la fiche etablissement avant les bulletins. Voir openpaye.co/docs/passage-des-cp-en-jours-ouvres-a-jours-ouvrables-ou-inversement",
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

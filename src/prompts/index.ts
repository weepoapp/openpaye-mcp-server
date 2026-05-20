import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "ouvrir_periode_paie",
    {
      description: "Ouvrir ou preparer une periode de paie (mois) avant saisie et bulletins",
      argsSchema: {
        dossierId: z.string().describe("Id numerique du dossier (openpaye_dossiers_list)"),
        codeDossier: z.string().describe("Code dossier string (openpaye_dossiers_list)"),
        annee: z.string().describe("Annee de paie cible"),
        mois: z.string().describe("Mois de paie (1-12)"),
      },
    },
    async ({ dossierId, codeDossier, annee, mois }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Ouvrir/preparer la periode de paie ${mois}/${annee} pour le dossier ${codeDossier} (id ${dossierId}).`,
              "Pas d'endpoint API « ouvrir periode » : voir openpaye://docs/ouvrir-periode.",
              "",
              "Interface OpenPaye (si acces manuel) :",
              "- Parametres → Mes domaines → Ouvrir domaine → Ouvrir dossier",
              `- Menu Bulletins → selectionner le mois ${mois}/${annee}`,
              "",
              "Workflow API :",
              `1) openpaye_dossiers_get id=${dossierId} — verifier le dossier et l'annee de debut.`,
              `2) openpaye_periode_ouvrir dossierId=${dossierId}, mois=${mois}, type=<rubrique> — verifier l'acces au mois (types sur https://api.openpaye.co/).`,
              "3) openpaye_salaries_list + openpaye_contrats_list avec dossierId.",
              "4) openpaye_variables_saisir_* pour saisir les elements variables du mois.",
              `5) openpaye_bulletin_generer codeDossier=${codeDossier}, annee=${annee}, mois=${mois}.`,
              "6) Controles : openpaye_editions_list (tableau des cotisations), puis DSN si fin de mois.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "paie_mensuelle",
    {
      description: "Orchestre la preparation d'une paie mensuelle",
      argsSchema: {
        annee: z.string().describe("Annee de paie"),
        mois: z.string().describe("Mois de paie (01-12)"),
      },
    },
    async ({ annee, mois }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Prepare un recap de paie pour ${mois}/${annee}.`,
              "0) Ouvrir la periode : prompt ouvrir_periode_paie ou openpaye_periode_ouvrir (dossierId + mois + type). Doc : openpaye://docs/ouvrir-periode.",
              "1) openpaye_dossiers_list — recuperer le code dossier (string) et id dossier.",
              "2) openpaye_salaries_list avec dossierId — lister les salaries actifs (matricule).",
              "3) openpaye_contrats_list avec dossierId — contrats en vigueur (id contrat, numeroContrat).",
              "4) Saisir les variables du mois : openpaye_variables_saisir_absence / _prime / _heures_sup / _option (ou prompt saisie_variables_paie).",
              "5) openpaye_bulletin_generer avec codeDossier + annee + mois (bulletins du dossier entier).",
              "   Ou openpaye_bulletin_calculer avec codeDossier + matricule + numeroContrat + plage mois/annee (un salarie).",
              "6) openpaye_variables_list avec dossierId (id numerique) + type + mois.",
              "7) openpaye_editions_list avec codeDossier + moisDebut/moisFin + annee (+ format PDF si besoin).",
              "8) Termine par une check-list des actions de controle.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "saisie_variables_paie",
    {
      description: "Saisir les elements variables du mois avant calcul des bulletins",
      argsSchema: {
        contratId: z.string().describe("Id numerique du contrat (openpaye_contrats_list)"),
        annee: z.string().describe("Annee de paie"),
        mois: z.string().describe("Mois de paie (1-12)"),
        type: z
          .enum(["absence", "prime", "heures_sup", "option", "reprise"])
          .describe("Type d'element variable a saisir"),
      },
    },
    async ({ contratId, annee, mois, type }) => {
      const toolByType: Record<string, string> = {
        absence: "openpaye_variables_saisir_absence",
        prime: "openpaye_variables_saisir_prime",
        heures_sup: "openpaye_variables_saisir_heures_sup",
        option: "openpaye_variables_saisir_option",
        reprise: "openpaye_variables_saisir_reprise",
      };
      const tool = toolByType[type];

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Saisir un element variable de paie pour contrat ${contratId}, periode ${mois}/${annee}, type=${type}.`,
                "Workflow OpenPaye : saisie variables → GET bulletin (calcul). Voir openpaye://docs/saisie-variables.",
                "1) openpaye_contrats_list / openpaye_variables_list pour obtenir contratId et codes variables.",
                `2) ${tool} avec contratId=${contratId}, mois=${mois}, annee=${annee} + champs du type :`,
                type === "absence"
                  ? "   code, date_debut, date_fin, nbr_heure_by_user, nbr_jour_by_user (ex. code 520 activite partielle)"
                  : type === "prime"
                    ? "   code, montant (ou bases/tauxs)"
                    : type === "heures_sup"
                      ? "   code, nombre"
                      : type === "option"
                        ? "   code, valeur1/2/3, actif1…8"
                        : "   nomVariable, valeur (query, pas de body)",
                "3) Verifier avec openpaye_absences_periode ou openpaye_variables_bulletins si besoin.",
                "4) Enchaine avec openpaye_bulletin_calculer ou openpaye_bulletin_generer.",
              ].join("\n"),
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "calculer_bulletin",
    {
      description: "Calculer ou generer les bulletins apres saisie des variables de paie",
      argsSchema: {
        codeDossier: z.string().describe("Code dossier (string, ex. depuis openpaye_dossiers_list)"),
        annee: z.string().describe("Annee de paie"),
        mois: z.string().describe("Mois de paie (1-12)"),
        matricule: z.string().optional().describe("Matricule salarie (si calcul d'un seul bulletin)"),
        numeroContrat: z.string().optional().describe("Numero contrat (si calcul d'un seul bulletin)"),
      },
    },
    async ({ codeDossier, annee, mois, matricule, numeroContrat }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Calculer/generer les bulletins pour le dossier ${codeDossier}, periode ${mois}/${annee}.`,
              "L'API OpenPaye n'expose pas de POST dedie : le calcul se fait via GET apres saisie des variables.",
              "1) Verifier/saisir les variables du mois : openpaye_variables_saisir_absence, _prime, _heures_sup, _option, _reprise, _net_entreprise.",
              matricule && numeroContrat
                ? `2) openpaye_bulletin_calculer avec codeDossier=${codeDossier}, matricule=${matricule}, numeroContrat=${numeroContrat}, moisDebut/moisFin=${mois}, anneeDebut/anneeFin=${annee}.`
                : `2) openpaye_bulletin_generer avec codeDossier=${codeDossier}, annee=${annee}, mois=${mois} (tous les salaries du dossier).`,
              "3) Optionnel : openpaye_bulletinspaies_details pour une ligne precise (contratid, variableARecuperer).",
              "4) Resumer net/brut, anomalies et prochaines actions (editions, DSN).",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "controle_dossier",
    {
      description: "Controle rapide d'un dossier de paie",
      argsSchema: {
        dossierId: z.string().describe("ID dossier"),
      },
    },
    async ({ dossierId }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Fais un controle de coherence du dossier ${dossierId}.`,
              "Utilise: openpaye_dossiers_get, openpaye_etablissements_list, openpaye_salaries_list, openpaye_contrats_list.",
              "Rends: anomalies, donnees manquantes, actions recommandees.",
            ].join("\n"),
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "onboarding_salarie",
    {
      description: "Guide de creation d'un salarie et rattachements",
      argsSchema: {
        nomComplet: z.string().describe("Nom complet du salarie"),
      },
    },
    async ({ nomComplet }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: [
              `Prepare l'onboarding de ${nomComplet}.`,
              "1) Verifie le dossier et l'etablissement.",
              "2) Cree le salarie via openpaye_salaries_create.",
              "3) Cree le contrat via openpaye_contrats_create.",
              "4) Propose les variables initiales a renseigner.",
            ].join("\n"),
          },
        },
      ],
    }),
  );
}

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
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
              "1) openpaye_dossiers_list — recuperer le code dossier (string) et id dossier.",
              "2) openpaye_salaries_list avec dossierId — lister les salaries actifs (matricule).",
              "3) openpaye_contrats_list avec dossierId — contrats en vigueur (id contrat, numeroContrat).",
              "4) Saisir les variables du mois si besoin (primes, absences, heures sup).",
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
              "1) Verifier/saisir les variables du mois : openpaye_primes_create, openpaye_absences_create, openpaye_heures_supp_create, openpaye_options_create, openpaye_net_entreprise_create.",
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

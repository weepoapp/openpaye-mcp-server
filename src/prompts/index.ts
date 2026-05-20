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
              "4) openpaye_bulletinspaies_by_periode avec codeDossier + annee + mois (liste bulletins du mois).",
              "   Ou openpaye_bulletinspaies_list avec codeDossier + matricule + numeroContrat + plage mois/annee.",
              "5) openpaye_variables_list avec dossierId (id numerique) + type + mois.",
              "6) openpaye_editions_list avec codeDossier + moisDebut/moisFin + annee (+ format PDF si besoin).",
              "7) Termine par une check-list des actions de controle.",
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

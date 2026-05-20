import { z } from "zod";
import {
  annee,
  codeDossier,
  contratId,
  contratid,
  dossierId,
  dsnFormat,
  editionFormat,
  matricule,
  mois,
  numeroContrat,
  page,
} from "./openpaye-fields.js";

export type ToolInputSchema = Record<string, z.ZodTypeAny>;

const bulletinSalarieSchema: ToolInputSchema = {
  codeDossier,
  matricule,
  numeroContrat,
  moisDebut: mois.describe("Mois de debut"),
  moisFin: mois.describe("Mois de fin"),
  anneeDebut: annee.describe("Annee de debut"),
  anneeFin: annee.describe("Annee de fin"),
  inclureDocumentDeSortie: z
    .boolean()
    .optional()
    .describe("Inclure le document de sortie dans la reponse"),
};

const bulletinDossierPeriodeSchema: ToolInputSchema = {
  codeDossier,
  annee,
  mois,
  page,
};

/** Schemas d'entree par tool (parametres au premier niveau, pas dans query). */
export const ENDPOINT_INPUT_SCHEMAS: Record<string, ToolInputSchema> = {
  openpaye_absences_get: {
    id: z.number().int().positive().describe("Identifiant de l'absence"),
  },
  openpaye_absences_periode: {
    contratId,
    anneeDebut: annee.describe("Annee de debut de la plage"),
    moisDebut: mois.describe("Mois de debut de la plage"),
    anneeFin: annee.describe("Annee de fin de la plage"),
    moisFin: mois.describe("Mois de fin de la plage"),
  },
  openpaye_absences_create: {
    contratId,
    body: z.unknown().describe("Corps JSON de l'absence (code, date_debut, date_fin, mois, annee, …)"),
  },
  openpaye_absences_update: {
    body: z.unknown().describe("Corps JSON de l'absence a modifier"),
  },
  openpaye_bulletinspaies_list: bulletinSalarieSchema,
  openpaye_bulletin_calculer: bulletinSalarieSchema,
  openpaye_bulletinspaies_details: {
    contratid,
    annee,
    mois,
    variableARecuperer: z.string().min(1).describe("Code de la ligne de bulletin a recuperer"),
  },
  openpaye_bulletinspaies_by_periode: bulletinDossierPeriodeSchema,
  openpaye_bulletin_generer: bulletinDossierPeriodeSchema,
  openpaye_caisse_cotisations_get: {
    id: z.number().int().positive().describe("Identifiant de la caisse de cotisations"),
  },
  openpaye_caisse_cotisations_create: {
    body: z.unknown().describe("Corps JSON de la caisse de cotisations"),
  },
  openpaye_contrats_list: {
    dossierId: dossierId.optional(),
    page,
  },
  openpaye_contrats_get: {
    id: z.number().int().positive().describe("Identifiant du contrat"),
  },
  openpaye_contrats_delete: {
    id: z.number().int().positive().describe("Identifiant du contrat"),
  },
  openpaye_contrats_create: {
    body: z.unknown().describe("Corps JSON du contrat"),
  },
  openpaye_contrats_update: {
    body: z.unknown().describe("Corps JSON du contrat a modifier"),
  },
  openpaye_contrat_sortant: {
    id: contratId.describe("Identifiant du contrat"),
    annee,
    mois,
  },
  openpaye_dossiers_list: { page },
  openpaye_dossiers_get: {
    id: z.number().int().positive().describe("Identifiant du dossier"),
  },
  openpaye_dossiers_delete: {
    id: z.number().int().positive().describe("Identifiant du dossier"),
  },
  openpaye_dossiers_create: {
    body: z.unknown().describe("Corps JSON du dossier"),
  },
  openpaye_dossiers_update: {
    body: z.unknown().describe("Corps JSON du dossier a modifier"),
  },
  openpaye_dossiers_by_siret: {
    siret: z.string().min(9).max(14).describe("SIRET du dossier (14 chiffres)"),
  },
  openpaye_dsns_list: {
    codeDossier,
    codeEtablissement: z.string().min(1).describe("Code etablissement"),
    mois,
    annee,
    format: dsnFormat,
  },
  openpaye_editions_list: {
    codeDossier,
    moisDebut: mois.describe("Mois de debut"),
    moisFin: mois.describe("Mois de fin"),
    annee,
    format: editionFormat,
  },
  openpaye_etablissements_list: {
    dossierId: dossierId.optional(),
    page,
  },
  openpaye_etablissements_get: {
    id: z.number().int().positive().describe("Identifiant de l'etablissement"),
  },
  openpaye_etablissements_delete: {
    id: z.number().int().positive().describe("Identifiant de l'etablissement"),
  },
  openpaye_etablissements_create: {
    body: z.unknown().describe("Corps JSON de l'etablissement"),
  },
  openpaye_etablissements_update: {
    body: z.unknown().describe("Corps JSON de l'etablissement a modifier"),
  },
  openpaye_heures_supp_create: {
    body: z.unknown().describe("Corps JSON des heures supplementaires"),
  },
  openpaye_heures_supp_update: {
    body: z.unknown().describe("Corps JSON des heures supplementaires a modifier"),
  },
  openpaye_net_entreprise_create: {
    body: z.unknown().describe("Corps JSON Net Entreprise"),
  },
  openpaye_net_entreprise_update: {
    body: z.unknown().describe("Corps JSON Net Entreprise a modifier"),
  },
  openpaye_options_create: {
    body: z.unknown().describe("Corps JSON des options"),
  },
  openpaye_options_update: {
    body: z.unknown().describe("Corps JSON des options a modifier"),
  },
  openpaye_primes_create: {
    body: z.unknown().describe("Corps JSON de la prime"),
  },
  openpaye_primes_update: {
    body: z.unknown().describe("Corps JSON de la prime a modifier"),
  },
  openpaye_salaries_list: {
    dossierId: dossierId.optional(),
    page,
  },
  openpaye_salaries_get: {
    id: z.number().int().positive().describe("Identifiant du salarie"),
  },
  openpaye_salaries_delete: {
    id: z.number().int().positive().describe("Identifiant du salarie"),
  },
  openpaye_salaries_create: {
    body: z.unknown().describe("Corps JSON du salarie"),
  },
  openpaye_salaries_update: {
    body: z.unknown().describe("Corps JSON du salarie a modifier"),
  },
  openpaye_solde_tout_compte: {
    codeDossier,
    matricule,
    numeroContrat,
  },
  openpaye_variables_list: {
    dossierId,
    type: z.string().min(1).describe("Type de variable (voir codes variables OpenPaye)"),
    mois,
  },
  openpaye_variables_bulletins: {
    contratId,
    annee,
    mois,
    variableARecuperer: z.string().min(1).describe("Nom de la variable bulletin a recuperer"),
  },
  openpaye_compteurs_conges: {
    contratId,
    annee,
    mois,
  },
  openpaye_variables_reprise_list: {
    contratId,
    nomVariable: z.string().min(1).describe("Nom de la variable reprise dossier"),
  },
  openpaye_variables_reprise_create: {
    contratId,
    nomVariable: z.string().min(1).describe("Nom de la variable reprise dossier"),
    valeur: z.string().describe("Valeur de la variable reprise dossier"),
  },
};

/** Descriptions enrichies (workflow + doc API). */
export const ENDPOINT_DESCRIPTIONS: Partial<Record<string, string>> = {
  openpaye_bulletinspaies_list:
    "Obtenir un bulletin de paie pour un salarie/contrat sur une plage de mois. Requiert codeDossier + matricule + numeroContrat (openpaye_dossiers_list, openpaye_salaries_list, openpaye_contrats_list).",
  openpaye_bulletin_calculer:
    "Calculer/obtenir le bulletin d'un salarie pour une periode (GET /bulletinspaies). L'API OpenPaye n'a pas de POST « calculer » : saisir d'abord les variables du mois (openpaye_primes_create, openpaye_absences_create, openpaye_heures_supp_create, …) puis appeler ce tool. Alias semantique de openpaye_bulletinspaies_list.",
  openpaye_bulletinspaies_by_periode:
    "Lister les bulletins d'un dossier pour un mois/annee. Requiert codeDossier (plus simple que bulletinspaies_list pour une periode donnee).",
  openpaye_bulletin_generer:
    "Generer/lister les bulletins de tous les salaries d'un dossier pour un mois (GET /bulletinspaies/listebulletinspaies). A utiliser apres saisie des variables de paie du mois. Alias semantique de openpaye_bulletinspaies_by_periode.",
  openpaye_bulletinspaies_details:
    "Detail d'une ligne de bulletin (parametre API contratid en minuscules, pas contratId).",
  openpaye_editions_list:
    "Obtenir une edition comptable/paie (format optionnel PDF, Excel, …). Requiert codeDossier + periode.",
  openpaye_variables_list:
    "Variables de paie d'un dossier. Utilise dossierId (id numerique), pas codeDossier.",
  openpaye_variables_bulletins:
    "Variable d'un bulletin pour un contrat/mois/annee.",
  openpaye_salaries_list: "Lister les salaries. Filtrer par dossierId (id numerique du dossier).",
  openpaye_contrats_list: "Lister les contrats. Filtrer par dossierId pour obtenir numeroContrat et id contrat.",
  openpaye_dossiers_list: "Lister les dossiers de paie. Retourne code (string) et id (numerique).",
  openpaye_dsns_list: "Obtenir une DSN. Requiert codeDossier, codeEtablissement, mois, annee.",
  openpaye_solde_tout_compte: "Solde de tout compte. Requiert codeDossier, matricule, numeroContrat.",
};

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
import {
  absenceSaisieSchema,
  heuresSupSaisieSchema,
  netEntrepriseSaisieSchema,
  optionSaisieSchema,
  primeSaisieSchema,
  variablesRepriseSaisieSchema,
} from "./variable-inputs.js";

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

const periodeOuvertureSchema: ToolInputSchema = {
  dossierId,
  type: z
    .string()
    .min(1)
    .describe(
      "Type de variable OpenPaye (ex. codes sur https://api.openpaye.co/ — souvent le nom du rubrique)",
    ),
  mois,
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
  openpaye_absences_create: absenceSaisieSchema,
  openpaye_variables_saisir_absence: absenceSaisieSchema,
  openpaye_absences_update: {
    id: z.number().int().positive().optional().describe("Identifiant absence (ignore en POST)"),
    code: z.string().min(1).optional(),
    date_debut: z.string().optional(),
    date_fin: z.string().optional(),
    mois: mois.optional(),
    annee: z.union([z.string(), z.number().int()]).optional(),
    nbr_heure_by_user: z.number().optional(),
    nbr_jour_by_user: z.number().optional(),
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
  openpaye_heures_supp_create: heuresSupSaisieSchema,
  openpaye_variables_saisir_heures_sup: heuresSupSaisieSchema,
  openpaye_heures_supp_update: {
    id: z.number().int().positive().optional(),
    code: z.string().min(1).optional(),
    nombre: z.number().optional(),
    mois: mois.optional(),
    annee: z.union([z.string(), z.number().int()]).optional(),
  },
  openpaye_net_entreprise_create: netEntrepriseSaisieSchema,
  openpaye_variables_saisir_net_entreprise: netEntrepriseSaisieSchema,
  openpaye_net_entreprise_update: {
    dossierId,
    id: z.number().int().positive().optional(),
    nom: z.string().optional(),
    prenom: z.string().optional(),
    siret: z.string().optional(),
    civilite: z.string().optional(),
    email: z.string().optional(),
    telephone: z.string().optional(),
    fax: z.string().optional(),
    mot_pass: z.string().optional(),
  },
  openpaye_options_create: optionSaisieSchema,
  openpaye_variables_saisir_option: optionSaisieSchema,
  openpaye_options_update: {
    id: z.number().int().positive().optional(),
    code: z.string().min(1).optional(),
    valeur1: z.number().optional(),
    valeur2: z.number().optional(),
    valeur3: z.number().optional(),
    date1: z.string().optional(),
    date2: z.string().optional(),
    date3: z.string().optional(),
    actif1: z.boolean().optional(),
    actif2: z.boolean().optional(),
    actif3: z.boolean().optional(),
    actif4: z.boolean().optional(),
    actif5: z.boolean().optional(),
    actif6: z.boolean().optional(),
    actif7: z.boolean().optional(),
    actif8: z.boolean().optional(),
    mois: mois.optional(),
    annee: z.union([z.string(), z.number().int()]).optional(),
  },
  openpaye_primes_create: primeSaisieSchema,
  openpaye_variables_saisir_prime: primeSaisieSchema,
  openpaye_primes_update: {
    id: z.number().int().positive().optional(),
    code: z.string().min(1).optional(),
    montant: z.number().optional(),
    bases: z.number().optional(),
    tauxs: z.number().optional(),
    mois: mois.optional(),
    annee: z.union([z.string(), z.number().int()]).optional(),
    ccn: z.number().int().optional(),
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
  openpaye_variables_list: periodeOuvertureSchema,
  openpaye_periode_ouvrir: periodeOuvertureSchema,
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
  openpaye_variables_reprise_create: variablesRepriseSaisieSchema,
  openpaye_variables_saisir_reprise: variablesRepriseSaisieSchema,
};

/** Descriptions enrichies (workflow + doc API). */
export const ENDPOINT_DESCRIPTIONS: Partial<Record<string, string>> = {
  openpaye_bulletinspaies_list:
    "Obtenir un bulletin de paie pour un salarie/contrat sur une plage de mois. Requiert codeDossier + matricule + numeroContrat (openpaye_dossiers_list, openpaye_salaries_list, openpaye_contrats_list).",
  openpaye_bulletin_calculer:
    "Calculer/obtenir le bulletin d'un salarie (GET /bulletinspaies — doc Redoc « Obtenir un bulletin de paie »). Pas de POST dedie : saisir d'abord les variables du mois (absences, primes, heures sup…) puis ce GET declenche le calcul. Voir ressource openpaye://docs/calcul-bulletin.",
  openpaye_bulletinspaies_by_periode:
    "Lister les bulletins d'un dossier pour un mois/annee (GET /bulletinspaies/listebulletinspaies).",
  openpaye_bulletin_generer:
    "Generer/obtenir les bulletins de tous les salaries d'un dossier pour un mois (GET /bulletinspaies/listebulletinspaies). Meme endpoint que by_periode ; a appeler apres saisie des variables. Voir openpaye://docs/calcul-bulletin.",
  openpaye_bulletinspaies_details:
    "Detail d'une ligne de bulletin (parametre API contratid en minuscules, pas contratId).",
  openpaye_editions_list:
    "Obtenir une edition comptable/paie (format optionnel PDF, Excel, …). Requiert codeDossier + periode.",
  openpaye_variables_list:
    "Variables de paie d'un dossier pour un mois. Utilise dossierId (id numerique), pas codeDossier. Liste des types : https://api.openpaye.co/",
  openpaye_periode_ouvrir:
    "Preparer/verifier l'ouverture d'une periode de paie (GET /variables). Pas de POST « ouvrir periode » dans l'API : chaque appel cible un mois explicite. Utiliser ce tool en debut de mois pour confirmer l'acces aux variables avant saisie. Voir openpaye://docs/ouvrir-periode.",
  openpaye_variables_bulletins:
    "Variable d'un bulletin pour un contrat/mois/annee.",
  openpaye_salaries_list: "Lister les salaries. Filtrer par dossierId (id numerique du dossier).",
  openpaye_contrats_list: "Lister les contrats. Filtrer par dossierId pour obtenir numeroContrat et id contrat.",
  openpaye_dossiers_list: "Lister les dossiers de paie. Retourne code (string) et id (numerique).",
  openpaye_dsns_list: "Obtenir une DSN. Requiert codeDossier, codeEtablissement, mois, annee.",
  openpaye_solde_tout_compte: "Solde de tout compte. Requiert codeDossier, matricule, numeroContrat.",
  openpaye_absences_create:
    "Ajouter une absence (element variable) pour un contrat/mois. Query contratId + body code, dates, mois, annee. Codes : openpaye_variables_list (dossierId + type).",
  openpaye_variables_saisir_absence:
    "Saisir une absence sur le bulletin du mois (POST /Abcenses). Etape 1 avant calcul bulletin. Alias de openpaye_absences_create.",
  openpaye_absences_periode:
    "Lister les absences d'un contrat sur une plage de mois (avant/apres saisie).",
  openpaye_primes_create:
    "Ajouter une prime (element variable) pour un contrat/mois. Query contratId + body code, montant, mois, annee.",
  openpaye_variables_saisir_prime:
    "Saisir une prime sur le bulletin du mois (POST /Primes). Alias de openpaye_primes_create.",
  openpaye_heures_supp_create:
    "Ajouter des heures supplementaires (element variable). Query contratId + body code, nombre, mois, annee.",
  openpaye_variables_saisir_heures_sup:
    "Saisir des heures supplementaires (POST /HeuresSupplementaires). Alias de openpaye_heures_supp_create.",
  openpaye_options_create:
    "Ajouter une option (element variable). Query contratId + body code, valeurs, mois, annee.",
  openpaye_variables_saisir_option:
    "Saisir une option de paie (POST /Options). Alias de openpaye_options_create.",
  openpaye_variables_reprise_create:
    "Saisir une variable reprise dossier (query contratId + nomVariable + valeur).",
  openpaye_variables_saisir_reprise:
    "Saisir une variable reprise dossier (POST /VariablesRepriseDossier).",
  openpaye_net_entreprise_create:
    "Parametrer Net-Entreprises pour un dossier. Query dossierId + body nom, prenom, siret, …",
  openpaye_variables_saisir_net_entreprise:
    "Saisir les identifiants Net-Entreprises du dossier (POST /NetEntreprise).",
};

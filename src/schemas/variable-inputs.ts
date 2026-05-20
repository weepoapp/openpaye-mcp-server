import { z } from "zod";
import { contratId, dossierId, mois } from "./openpaye-fields.js";

/** Annee dans le corps JSON OpenPaye (string attendue par l'API). */
export const anneeBody = z
  .union([z.string(), z.number().int()])
  .transform(String)
  .describe("Annee de paie (ex. 2026)");

export const absenceSaisieSchema = {
  contratId,
  code: z.string().min(1).describe("Code absence OpenPaye (ex. 520 = activite partielle)"),
  date_debut: z.string().optional().describe("Date de debut (ISO, ex. 2026-05-01)"),
  date_fin: z.string().optional().describe("Date de fin (ISO)"),
  mois,
  annee: anneeBody,
  nbr_heure_by_user: z.number().optional().describe("Nombre d'heures saisies"),
  nbr_jour_by_user: z.number().optional().describe("Nombre de jours saisis"),
};

export const primeSaisieSchema = {
  contratId,
  code: z.string().min(1).describe("Code prime OpenPaye"),
  montant: z.number().optional().describe("Montant de la prime"),
  bases: z.number().optional().describe("Base salariale de la prime"),
  tauxs: z.number().optional().describe("Taux salarial de la prime"),
  mois,
  annee: anneeBody,
  ccn: z.number().int().optional().describe("Code convention collective (CCN)"),
};

export const heuresSupSaisieSchema = {
  contratId,
  code: z.string().min(1).describe("Code heures supplementaires OpenPaye"),
  nombre: z.number().describe("Nombre d'heures supplementaires"),
  mois,
  annee: anneeBody,
};

export const optionSaisieSchema = {
  contratId,
  code: z.string().min(1).describe("Code option OpenPaye"),
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
  mois,
  annee: anneeBody,
};

export const variablesRepriseSaisieSchema = {
  contratId,
  nomVariable: z.string().min(1).describe("Nom de la variable reprise dossier"),
  valeur: z.string().describe("Valeur de la variable reprise dossier"),
};

export const netEntrepriseSaisieSchema = {
  dossierId,
  nom: z.string().min(1).describe("Nom du contact Net-Entreprises"),
  prenom: z.string().min(1).describe("Prenom du contact Net-Entreprises"),
  siret: z.string().min(14).max(14).describe("SIRET entreprise (14 chiffres)"),
  civilite: z.string().optional().describe("Civilite (M., MME)"),
  email: z.string().optional(),
  telephone: z.string().optional(),
  fax: z.string().optional(),
  mot_pass: z.string().optional().describe("Mot de passe Net-Entreprises"),
};

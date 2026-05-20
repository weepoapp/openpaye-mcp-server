import { z } from "zod";

/** Champs communs alignes sur https://openpaye.redoc.ly/ */

export const page = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe("Numero de page (pagination API, index 0 = premiere page)");

export const dossierId = z
  .number()
  .int()
  .positive()
  .describe("Identifiant numerique du dossier (id retourne par openpaye_dossiers_list)");

export const codeDossier = z
  .string()
  .min(1)
  .describe("Code dossier OpenPaye (champ code, pas l'id numerique — voir openpaye_dossiers_list)");

export const matricule = z.string().min(1).describe("Matricule du salarie (openpaye_salaries_list)");

export const numeroContrat = z.string().min(1).describe("Numero de contrat du salarie (openpaye_contrats_list)");

export const contratId = z
  .number()
  .int()
  .positive()
  .describe("Identifiant numerique du contrat (id retourne par openpaye_contrats_list)");

/** Parametre API BulletinDetail : orthographe exacte contratid (tout minuscules). */
export const contratid = z
  .number()
  .int()
  .positive()
  .describe("Identifiant du contrat (parametre API contratid, minuscules — BulletinDetail)");

export const mois = z.number().int().min(1).max(12).describe("Mois (1=janvier … 12=decembre)");

export const annee = z.number().int().min(2000).max(2100).describe("Annee (ex. 2026)");

export const editionFormat = z
  .enum(["PDF", "Excel", "QUICKBOOKS", "INFORCE", "QUADRATUS", "CIEL", "FEC"])
  .optional()
  .describe("Format d'edition (PDF, Excel, etc.)");

export const dsnFormat = z.enum(["txt", "pdf"]).optional().describe("Format DSN (txt ou pdf)");

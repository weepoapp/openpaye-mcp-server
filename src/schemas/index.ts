import { z } from "zod";

export const genericRequestSchema = {
  query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  body: z.unknown().optional(),
};

export const entityIdSchema = {
  id: z.number().int().positive(),
};

export const periodSchema = {
  anneeDebut: z.number().int(),
  moisDebut: z.number().int().min(1).max(12),
  anneeFin: z.number().int(),
  moisFin: z.number().int().min(1).max(12),
};

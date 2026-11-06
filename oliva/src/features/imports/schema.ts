import { z } from "zod";
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;
export const originSchema = z
  .object({
    importId: z.string().regex(/^fp5-[a-f0-9]{64}$/),
    kind: z.enum(["path", "journal", "reflection"]),
    sourceId: z.string().max(1000),
    sourceKeys: z
      .array(z.string().regex(/^fp5-(path|journal|reflection)-[a-f0-9]{64}$/))
      .min(1)
      .max(100),
    entityHash: z.string().regex(/^[a-f0-9]{64}$/),
    category: z.string().max(100).optional(),
    referenceLabel: z.string().max(200).optional(),
  })
  .strict();
export const countsSchema = z
  .object({
    paths: z.number().int().nonnegative(),
    notes: z.number().int().nonnegative(),
    highlights: z.number().int().nonnegative(),
    chapters: z.number().int().nonnegative(),
    mirrors: z.number().int().nonnegative(),
    conflicts: z.number().int().nonnegative(),
  })
  .strict();
export const receiptSchema = z
  .object({
    id: z.string().regex(/^fp5-[a-f0-9]{64}$/),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
    importedAt: z.string().datetime(),
    sourceText: z.string().max(MAX_SOURCE_BYTES),
    sourceExported: z.string().nullable(),
    counts: countsSchema,
    entities: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)),
    addedChapters: z.array(z.string().regex(/^[A-Z0-9]{3}:\d+$/)).max(1189),
  })
  .strict()
  .refine((r) => r.id === "fp5-" + r.fingerprint);
export type ImportReceipt = z.infer<typeof receiptSchema>;
export type ImportedOrigin = z.infer<typeof originSchema>;
export type RecoveryCopy = {
  token: string;
  createdAt: string;
  data: import("../../state/model").AppData;
};
export type WriteOptions = {
  createRecovery?: { token: string; createdAt: string };
  consumeRecoveryToken?: string;
};

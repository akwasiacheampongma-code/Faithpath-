import { z } from "zod";
import {
  dataSchema,
  v4DataSchema,
  decodeData,
  type AppData,
} from "../state/model";
import { receiptSchema } from "../features/imports/schema";
export const ARCHIVE_PREFIX = "archive:";
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const metadata = z
  .object({ ...receiptSchema.shape })
  .omit({ sourceText: true })
  .strict();
const currentStoredData = z.object({ ...dataSchema.shape, imports: z.array(metadata).max(100) }).strict();
const storedSchema = z
  .object({
    storageVersion: z.literal(1),
    data: z.discriminatedUnion("version", [
      z
        .object({ ...v4DataSchema.shape, imports: z.array(metadata).max(100) })
        .strict(),
      currentStoredData,
    ]),
  })
  .strict();
export type StoredDocument = { storageVersion: 1; data: z.infer<typeof currentStoredData> };
export function forStorage(data: AppData): StoredDocument {
  return {
    storageVersion: 1,
    data: {
      ...data,
      imports: data.imports.map(({ sourceText, ...fields }) => fields),
    },
  };
}
export function documentRevision(value: unknown) {
  if (value === undefined) return 0;
  if (!value || typeof value !== "object")
    throw new Error("Der lokale Datenstand ist beschädigt.");
  const obj = value as Record<string, unknown>,
    data =
      "storageVersion" in obj
        ? obj.storageVersion === 1
          ? obj.data
          : null
        : obj;
  if (
    !data ||
    typeof data !== "object" ||
    !("revision" in data) ||
    typeof data.revision !== "number" ||
    !Number.isInteger(data.revision) ||
    data.revision < 0
  )
    throw new Error("Der lokale Datenstand ist beschädigt.");
  return data.revision;
}
export function archiveHashes(document: unknown): string[] {
  if (
    !document ||
    typeof document !== "object" ||
    !("storageVersion" in document)
  )
    return [];
  return storedSchema.parse(document).data.imports.map((r) => r.sourceHash);
}
export function checkedHashes(input: unknown): string[] {
  return z.array(hash).max(200).parse(input);
}
export async function decodeStored(
  value: unknown,
  load: (hash: string) => Promise<string>,
): Promise<AppData> {
  if (!value || typeof value !== "object" || !("storageVersion" in value))
    return decodeData(value);
  const stored = storedSchema.parse(value);
  const imports = await Promise.all(
    stored.data.imports.map(async (meta) => ({
      ...meta,
      sourceText: await load(meta.sourceHash),
    })),
  );
  return decodeData({ ...stored.data, imports });
}

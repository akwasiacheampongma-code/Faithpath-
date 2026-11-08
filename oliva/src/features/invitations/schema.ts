import { z } from "zod";

// IDs come from existing goals/notes; controls carry no copy of their text.
const key = z.string().regex(/^(goal|note):[\s\S]{1,100}$/);
const choices = z
  .record(key, z.string().datetime())
  .refine(
    (values) => Object.keys(values).length <= 10000,
    "Zu viele gespeicherte Einladungsentscheidungen",
  );
export const invitationControlsSchema = z
  .object({
    enabled: z.boolean(),
    snoozed: choices,
    dismissed: choices,
  })
  .strict();

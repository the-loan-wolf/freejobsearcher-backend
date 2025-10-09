import { z } from "zod";

const FirestoreValueSchema: z.ZodType<any> = z.union([
  z.object({ stringValue: z.string() }),
  z.object({ integerValue: z.string() }),
  z.object({ doubleValue: z.number() }),
  z.object({ booleanValue: z.boolean() }),
  z.object({ nullValue: z.null() }),
  z.object({ timestampValue: z.string() }),
  z.object({
    arrayValue: z.object({
      values: z.array(z.lazy(() => FirestoreValueSchema)).optional(),
    }),
  }),
  z.object({
    mapValue: z.object({
      fields: z.record(
        z.string(),
        z.lazy(() => FirestoreValueSchema)
      ),
    }),
  }),
]);

const FirestoreDocumentSchema = z.object({
  name: z.string(),
  fields: z.record(z.string(), FirestoreValueSchema),
  createTime: z.string().optional(),
  updateTime: z.string().optional(),
});

const FirestoreDocumentArraySchema = z.array(
  z.object({
    document: FirestoreDocumentSchema,
    readTime: z.string(),
  })
);

export type AppEnv = {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_API_KEY: string;
};

export { FirestoreDocumentSchema, FirestoreDocumentArraySchema };

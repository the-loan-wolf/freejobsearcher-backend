import z from "zod";
import { resumeSchema } from "../routes/resume/resume";

// Recursively converts Firestore "fields" objects into plain JS
export function parseFirestoreValue(value: any): any {
  if (value === undefined || value === null) return null;

  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue, 10);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("nullValue" in value) return null;

  if ("arrayValue" in value)
    return (value.arrayValue.values || []).map(parseFirestoreValue);

  if ("mapValue" in value)
    return parseFirestoreFields(value.mapValue.fields || {});

  return value;
}

export function parseFirestoreFields(
  fields: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(val);
  }
  return result;
}

// Utility to transform JS object into Firestore REST schema fields
const mapToFirestoreFields = (obj: Record<string, any>) => {
  const fields: Record<string, any> = {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "string") fields[key] = { stringValue: val };
    else if (typeof val === "number") fields[key] = { integerValue: val };
    else if (typeof val === "boolean") fields[key] = { booleanValue: val };
    else if (Array.isArray(val))
      fields[key] = {
        arrayValue: { values: val.map((v) => ({ stringValue: String(v) })) },
      };
    else if (typeof val === "object" && val !== null)
      fields[key] = { mapValue: { fields: mapToFirestoreFields(val) } };
  }
  return fields;
};

function firestoreDocMaker(body: z.infer<typeof resumeSchema>) {
  const now = new Date().toISOString();

  // Firestore expects field values wrapped in Firestore data types
  const resumeData = {
    fields: {
      profile: { mapValue: { fields: mapToFirestoreFields(body.profile) } },
      contact: { mapValue: { fields: mapToFirestoreFields(body.contact) } },
      education: {
        arrayValue: {
          values: body.education.map((e: any) => ({
            mapValue: { fields: mapToFirestoreFields(e) },
          })),
        },
      },
      workHistory: {
        arrayValue: {
          values: body.workHistory.map((w: any) => ({
            mapValue: { fields: mapToFirestoreFields(w) },
          })),
        },
      },
      achievements: {
        arrayValue: {
          values: body.achievements.map((a: string) => ({ stringValue: a })),
        },
      },
      skills: {
        arrayValue: {
          values: body.skills.map((s: string) => ({ stringValue: s })),
        },
      },
      createdAt: { timestampValue: now },
      updatedAt: { timestampValue: now },
    },
  };
  return resumeData;
}

export { mapToFirestoreFields, firestoreDocMaker };

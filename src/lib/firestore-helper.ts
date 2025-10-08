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

export { mapToFirestoreFields };

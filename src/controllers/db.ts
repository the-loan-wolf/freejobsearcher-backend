import { Context } from "hono";
import { parseFirestoreFields } from "../lib/firestore-helper";

export const feedHandler = async (c: Context) => {
  const token = c.req.header("Authorization");
  const { limit, country, search } = c.req.valid("query");

  // Default: 5 users for public requests
  const maxLimit = token ? parseInt(limit || "20") : 5;

  // Build Firestore query (using REST API)
  const projectId = c.env.FIREBASE_PROJECT_ID;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "users" }],
      limit: maxLimit,
      where: country
        ? {
            fieldFilter: {
              field: { fieldPath: "country" },
              op: "EQUAL",
              value: { stringValue: country },
            },
          }
        : undefined,
    },
  };

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  try {
    console.log(url);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "resumes" }],
          limit: 5,
        },
      }),
    });
    type FirestoreDocument = Array<{
      document: {
        name: string;
        fields: { [key: string]: any };
        createTime: string;
        updateTime: string;
      };
      readTime: string;
    }>;
    const data: FirestoreDocument = await res.json();

    const resumes = data
      .filter((r) => r.document) // skip empty rows
      .map((r) => {
        const doc = r.document;
        const data = parseFirestoreFields(doc.fields);

        return {
          id: doc.name.split("/").pop(),
          ...data.profile,
          skills: data.skills,
        };
      });

    // console.log(JSON.stringify(resumes, null, 2));
    return c.json({ resumes });
  } catch (error) {
    console.log(error);
  }
};

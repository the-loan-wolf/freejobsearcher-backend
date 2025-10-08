import { mapToFirestoreFields } from "../lib/firestore-helper";
import { getFirebaseToken } from "@hono/firebase-auth";
import { RouteHandler, z } from "@hono/zod-openapi";
import { createResumeRoute, resumeSchema } from "../routes/resume";
import { AppEnv } from "../lib/types";
import { refreshTokenFn } from "./auth";

/**
 * Adds a new resume document to Firestore via REST API.
 * Uses Firestore REST endpoint:
 * https://firestore.googleapis.com/v1/Ids/{project}/databases/(default)/documents/{collection}
 * it need firebase idToken to be set as Authorization header (Bearer idToken)
 * to work!
 */

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

export const addResumeHandler: RouteHandler<
  typeof createResumeRoute,
  { Bindings: AppEnv }
> = async (c) => {
  const idToken = getFirebaseToken(c); // get id-token object.
  const uid = idToken?.uid;
  const response = await refreshTokenFn(c);
  if (!response) return c.json({ error: "missing refresh token" }, 500);
  const res = await response.json();
  const accessToken = res.access_token;

  try {
    const body: z.infer<typeof resumeSchema> = await c.req.json();
    const { FIREBASE_PROJECT_ID } = c.env;

    const resumeData = firestoreDocMaker(body);

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/resumes/${uid}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(resumeData),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Firestore error:", err);
      return c.json({ error: "Failed to upload resume" }, 500);
    }

    const result = await response.json();
    const id = result.name?.split("/").pop();

    return c.json({ id, message: "Resume uploaded successfully" }, 201);
  } catch (err) {
    console.error("Error uploading resume:", err);
    return c.json({ error: "Unexpected server error" }, 500);
  }
};

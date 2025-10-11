import {
  firestoreDocMaker,
  parseFirestoreFields,
} from "../lib/firestore-helper";
import { RouteHandler, z } from "@hono/zod-openapi";
import { resumeSchema } from "../routes/resume/resume";
import { AppEnv, FirestoreDocumentSchema } from "../lib/types";
import { createFetchResumeRoute } from "../routes/resume/fetchResume";
import { Context } from "hono";

/**
 * Adds a new dummy resume document to Firestore via REST API.
 * Uses Firestore REST endpoint:
 * https://firestore.googleapis.com/v1/Ids/{project}/databases/(default)/documents/{collection}
 */

export const addFetchResumeHandler: RouteHandler<
  typeof createFetchResumeRoute,
  { Bindings: AppEnv }
> = async (c) => {
  try {
    const { uid } = c.req.valid("param");
    const { FIREBASE_PROJECT_ID } = c.env;

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/resumes/${uid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 404) {
      return c.json({ error: "Resume not found" }, 404);
    }

    if (!response.ok) {
      const err = await response.text();
      console.error("[fetchResume] Firestore error:", err);
      return c.json({ error: "Failed to fetch resume" }, 500);
    }

    const unparsedData = await response.json();
    const result = FirestoreDocumentSchema.parse(unparsedData);
    const data = parseFirestoreFields(result.fields) || {};

    return c.json({ ...data }, 200);
  } catch (err) {
    console.error("Error uploading resume:", err);
    return c.json({ error: "Unexpected server error" }, 500);
  }
};

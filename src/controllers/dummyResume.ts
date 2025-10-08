import { firestoreDocMaker } from "../lib/firestore-helper";
import { RouteHandler, z } from "@hono/zod-openapi";
import { resumeSchema } from "../routes/resume/resume";
import { AppEnv } from "../lib/types";
import { createDummyResumeRoute } from "../routes/resume/dummyResume";

/**
 * Adds a new dummy resume document to Firestore via REST API.
 * Uses Firestore REST endpoint:
 * https://firestore.googleapis.com/v1/Ids/{project}/databases/(default)/documents/{collection}
 */

export const addDummyResumeHandler: RouteHandler<
  typeof createDummyResumeRoute,
  { Bindings: AppEnv }
> = async (c) => {
  try {
    const body: z.infer<typeof resumeSchema> = await c.req.json();
    const { FIREBASE_PROJECT_ID } = c.env;

    const resumeData = firestoreDocMaker(body);

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/resumes/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

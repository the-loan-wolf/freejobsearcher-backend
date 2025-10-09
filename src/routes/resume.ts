import {
  verifyFirebaseAuth,
  VerifyFirebaseAuthConfig,
} from "../middlewares/firebase-auth";
import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "../lib/types";
import { createResumeRoute } from "./resume/resume";
import { addResumeHandler } from "../controllers/resume";
import { createDummyResumeRoute } from "./resume/dummyResume";
import { addDummyResumeHandler } from "../controllers/dummyResume";

const config: VerifyFirebaseAuthConfig = {
  // specify your firebase project ID.
  projectId: "freejob-abedb",
};

export const resume = new OpenAPIHono<{ Bindings: AppEnv }>();
resume.use("/resume", verifyFirebaseAuth(config));
resume.openapi(createResumeRoute, addResumeHandler);
resume.openapi(createDummyResumeRoute, addDummyResumeHandler);

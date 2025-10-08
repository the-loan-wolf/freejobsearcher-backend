import { createRoute, z } from "@hono/zod-openapi";
import { resumeSchema, resumeSchemaExample } from "./resume";

// ------------------------------
// OpenAPI Route Definition
// ------------------------------
export const createDummyResumeRoute = createRoute({
  method: "post",
  path: "/resume/dummy",
  operationId: "createDummyResume",
  description: `This route is for adding dummy resume,
  only works if firestore rules allows writing to resume collection
  without authentication`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: resumeSchema,
          example: resumeSchemaExample,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Resume uploaded successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    400: { description: "Invalid input" },
    500: { description: "Server error" },
  },
  tags: ["Resume"],
});

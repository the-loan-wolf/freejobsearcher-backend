import { createRoute, z } from "@hono/zod-openapi";
import { resumeSchema, resumeSchemaExample } from "./resume";

// ------------------------------
// OpenAPI Route Definition
// ------------------------------
export const createFetchResumeRoute = createRoute({
  method: "get",
  path: "/resume/{uid}",
  request: {
    params: z.object({
      uid: z.string().openapi({
        param: { name: "uid", in: "path" },
        example: "fJeSA8F8kCc5pRCzrrpg9YE47o32",
      }),
    }),
  },
  description: `Fetch resume of a single user.`,
  responses: {
    200: {
      description: "Resume fetched successfully",
      content: {
        "application/json": {
          schema: resumeSchema,
          example: resumeSchemaExample,
        },
      },
    },
    404: { description: "Resume not found" },
    500: { description: "Server error" },
  },
  tags: ["Resume"],
});

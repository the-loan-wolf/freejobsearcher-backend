import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { feedHandler } from "../controllers/db";

export const db = new OpenAPIHono();

// Define your response schema
const feedData = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    location: z.string(),
    salary: z.string(),
    image: z.string(),
    experience: z.string(),
    bio: z.string(),
    skills: z.array(z.string()),
  })
);

// Define your query params
const feedQuery = z.object({
  limit: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "limit",
        in: "query",
        description: "Number of users to return",
        example: "10",
      },
    }),
  country: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "country",
        in: "query",
        description: "Filter users by country code",
        example: "US",
      },
    }),
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "search",
        in: "query",
        description: "Search by name or username",
        example: "alice",
      },
    }),
});

// Homefeed without authentication. returns only 5 users. and if a user is authenticaated then allow fetching more
export const userFeedRoute = createRoute({
  method: "get",
  path: "/user/feed",
  request: {
    query: feedQuery,
  },
  responses: {
    200: {
      description: "Fetch user feed (5 users public, more if authenticated)",
      content: {
        "application/json": {
          schema: feedData,
        },
      },
    },
    400: { description: "Bad request" },
  },
  tags: ["Feed"],
});

db.openapi(userFeedRoute, feedHandler);

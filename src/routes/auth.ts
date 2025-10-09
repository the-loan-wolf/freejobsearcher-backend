import { authlogin, authRefresh, authSignup } from "../controllers/auth";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const auth = new OpenAPIHono();

// ----------------- Schemas -----------------
const AuthRequestSchema = z.object({
  email: z.email().openapi({ example: "user@example.com" }),
  password: z.string().openapi({ example: "string" }),
});

export const SignupResponseSchema = z.object({
  kind: z.string(),
  idToken: z.string(),
  email: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  localId: z.string(),
});

export const LoginResponseSchema = z.object({
  kind: z.string(),
  localId: z.string(),
  email: z.string(),
  displayName: z.string(),
  idToken: z.string(),
  registered: z.boolean(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.string(),
  token_type: z.string(),
  id_token: z.string(),
  user_id: z.string(),
  project_id: z.string(),
});

// ----------------- Signup -----------------
auth.openapi(
  createRoute({
    method: "post",
    path: "/auth/signup",
    request: {
      body: {
        content: {
          "application/json": {
            schema: AuthRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Signup successful",
        content: {
          "application/json": {
            schema: SignupResponseSchema,
          },
        },
      },
      400: { description: "Bad request" },
    },
    tags: ["Auth"],
  }),
  authSignup
);

// ----------------- Login -----------------
auth.openapi(
  createRoute({
    method: "post",
    path: "/auth/login",
    request: {
      body: {
        content: {
          "application/json": {
            schema: AuthRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: LoginResponseSchema,
          },
        },
      },
      400: { description: "Bad request" },
    },
    tags: ["Auth"],
  }),
  authlogin
);

// ----------------- Refresh -----------------
auth.openapi(
  createRoute({
    method: "post",
    path: "/auth/refresh",
    responses: {
      200: {
        description: "New ID token issued",
        content: {
          "application/json": {
            schema: RefreshResponseSchema,
          },
        },
      },
      401: { description: "No refresh token" },
    },
    tags: ["Auth"],
  }),
  authRefresh
);

export default auth;

import { authlogin, authRefresh, authSignup } from '../controllers/auth';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'

const auth = new OpenAPIHono();

// ----------------- Schemas -----------------
const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const AuthResponseSchema = z.object({
  message: z.string(),
  idToken: z.string(),
  refreshToken: z.string(),
})

const RefreshResponseSchema = z.object({
  message: z.string(),
  idToken: z.string(),
})

// ----------------- Signup -----------------
auth.openapi(
  createRoute({
    method: 'post',
    path: '/auth/signup',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AuthRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Signup successful',
        content: {
          'application/json': {
            schema: AuthResponseSchema,
          },
        },
      },
      400: { description: 'Bad request' },
    },
    tags: ['Auth'],
  }),
  authSignup
)

// ----------------- Login -----------------
auth.openapi(
  createRoute({
    method: 'post',
    path: '/auth/login',
    request: {
      body: {
        content: {
          'application/json': {
            schema: AuthRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Login successful',
        content: {
          'application/json': {
            schema: AuthResponseSchema,
          },
        },
      },
      400: { description: 'Bad request' },
    },
    tags: ['Auth'],
  }),
  authlogin
)

// ----------------- Refresh -----------------
auth.openapi(
  createRoute({
    method: 'post',
    path: '/auth/refresh',
    responses: {
      200: {
        description: 'New ID token issued',
        content: {
          'application/json': {
            schema: RefreshResponseSchema,
          },
        },
      },
      401: { description: 'No refresh token' },
    },
    tags: ['Auth'],
  }),
  authRefresh
)

export default auth;

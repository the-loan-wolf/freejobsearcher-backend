import { OpenAPIHono } from '@hono/zod-openapi'
import packageJSON from "../package.json";
import { swaggerUI } from '@hono/swagger-ui';
import auth from './routes/auth';

const app = new OpenAPIHono({ strict: false });

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: packageJSON.version,
    title: "FreeJobSearcher APIs",
  },
});

app.get(
  "/reference",
  swaggerUI({
    url: "/doc",
  }),
);

app.route('/', auth)
export default app

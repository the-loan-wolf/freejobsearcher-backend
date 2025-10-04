import { OpenAPIHono } from "@hono/zod-openapi";
import packageJSON from "../package.json";
import { swaggerUI } from "@hono/swagger-ui";
import auth from "./routes/auth";
import { db } from "./routes/db";
import { Scalar } from "@scalar/hono-api-reference";

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
  })
);

app.get(
  "/",
  Scalar((c) => {
    return {
      url: "/doc",
    };
  })
);

app.route("/", auth);
app.route("/", db);
export default app;

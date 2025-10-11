import { OpenAPIHono } from "@hono/zod-openapi";
import packageJSON from "../package.json";
import auth from "./routes/auth";
import { db } from "./routes/db";
import { Scalar } from "@scalar/hono-api-reference";
import { resume } from "./routes/resume";
import { cors } from "hono/cors";

const app = new OpenAPIHono({ strict: false });
app.use('*', cors());

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: packageJSON.version,
    title: "FreeJobSearcher APIs",
  },
});

app.get(
  "/",
  Scalar((c) => {
    return {
      url: "/doc",
    };
  })
);

app.get("/favicon.ico", (c) => {
  return c.redirect("https://scalar.com/favicon.svg");
});

app.route("/", auth);
app.route("/", db);
app.route("/", resume);
export default app;

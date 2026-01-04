import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./docs/openapi";
import usersRouter from "./routes/users";
import groupsRouter from "./routes/groups";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/users", usersRouter);
app.use("/groups", groupsRouter);

app.use(errorHandler);

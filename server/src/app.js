import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authRoutes from "./modules/auth/auth.routes.js";
import pollRoutes from "./modules/poll/poll.routes.js";
import responseRoutes from "./modules/responses/responses.routes.js";
import errorMiddleware from "./common/middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === "production";
const clientDist = path.join(__dirname, "../../client/dist");

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  }),
);
app.use(express.json());
if (isProd) {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    }),
  );
}

app.use("/api/auth", authRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/responses", responseRoutes);

const spaIndex = path.join(clientDist, "index.html");
if (fs.existsSync(spaIndex)) {
  app.use(express.static(clientDist, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(spaIndex, (err) => (err ? next(err) : undefined));
  });
}

app.use(errorMiddleware);

export default app;

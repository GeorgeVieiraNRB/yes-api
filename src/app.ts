import cors from "cors";
import express from "express";
import { apiErrorMiddleware, notFoundMiddleware } from "./middlewares/error";
import { router } from "./routes";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(notFoundMiddleware);
app.use(apiErrorMiddleware);

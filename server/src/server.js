import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import configViewEngine from "./config/viewEngine.js";
import initWebRoutes from "./routes/web.js";
import initApiRoutes from "./routes/api.js";
import configCors from "./config/cors.js";
import connectToDataBase from "./config/connectDb.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "../public/images")));

configCors(app);
configViewEngine(app);

app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cookieParser());

initApiRoutes(app);
initWebRoutes(app);

connectToDataBase();

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(">>> Backend is running on port =", PORT);
});

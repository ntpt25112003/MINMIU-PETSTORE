import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/**
 * @param {*} app - express app
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configViewEngine = (app) => {
    // static public
    app.use(express.static(path.join(__dirname, "../../public")));

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "../views"));
};

export default configViewEngine;

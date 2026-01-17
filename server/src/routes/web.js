import express from "express";
const router = express.Router();

/**
 * 
 * @param {*} app :express app
 */



const initWebRoutes = (app) => {
    // router.all('*', JWTservice.checkCookieService, JWTservice.authenticateCookieService);


    return app.use("/", router)
}

export default initWebRoutes;
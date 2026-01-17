import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const configCors = (app) => {
  const allowedOrigins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:80",
    "http://localhost:80",
    "http://localhost",
    `http://${process.env.HOST_URL}:80`,
    `http://${process.env.HOST_URL}`,
  ];

  app.use(
    cors({
      credentials: true,
      origin: allowedOrigins,
    })
  );

  console.log("cor", process.env.REACT_URL + ":3000");

  app.use(function (req, res, next) {
    console.log("path cors", req.headers.origin);
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials", true);

    next();
  });
};

export default configCors;

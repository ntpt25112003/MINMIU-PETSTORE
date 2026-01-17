import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      EC: -1,
      EM: "No token provided",
      DT: ""
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      EC: -1,
      EM: "Invalid token",
      DT: ""
    });
  }
};

export { verifyToken };
export default verifyToken;

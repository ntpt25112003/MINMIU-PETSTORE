import db from "../models/index.js";

const requireManager = async (req, res, next) => {
  try {
    // token chỉ chứa id → dùng id để check Manager
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        EC: -1,
        EM: "Unauthorized",
        DT: "",
      });
    }

    const manager = await db.Manager.findByPk(userId);

    if (!manager) {
      return res.status(403).json({
        EC: -1,
        EM: "Forbidden: Manager only",
        DT: "",
      });
    }

    // Có thể gán thêm cho chắc
    req.manager = manager;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Server error",
      DT: "",
    });
  }
};

export default requireManager;

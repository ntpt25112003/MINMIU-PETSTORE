import db from '../models/index.js';

const createReviewController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, comment } = req.body;

    if (!productId || !orderId || !rating || !comment) {
      return res.status(400).json({
        EC: -1,
        EM: "Missing required fields",
        DT: ""
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        EC: -1,
        EM: "Rating must be between 1 and 5",
        DT: ""
      });
    }

    // Check if order belongs to user
    const order = await db.Order.findOne({
      where: { id: orderId, userId: userId }
    });

    if (!order) {
      return res.status(403).json({
        EC: -1,
        EM: "Order not found or doesn't belong to you",
        DT: ""
      });
    }

    // Check if user already reviewed this product in this order
    const existingReview = await db.Review.findOne({
      where: { userId, productId, orderId }
    });

    if (existingReview) {
      return res.status(400).json({
        EC: -1,
        EM: "You have already reviewed this product",
        DT: ""
      });
    }

    const review = await db.Review.create({
      userId,
      productId,
      orderId,
      rating: parseInt(rating, 10),
      comment
    });

    return res.status(201).json({
      EC: 0,
      EM: "Review created successfully",
      DT: review
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message
    });
  }
};

const getProductReviewsController = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    const reviews = await db.Review.findAll({
      where: { productId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "userName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      EC: 0,
      EM: "Get reviews successfully",
      DT: reviews,
    });
  } catch (error) {
    console.error("Error getting reviews:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

const checkReviewedController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ EC: -1, EM: "Missing productId", DT: "" });
    }

    const existed = await db.Review.findOne({
      where: { userId, productId: parseInt(productId, 10) },
      attributes: ["id"],
    });

    return res.status(200).json({
      EC: 0,
      EM: "OK",
      DT: { reviewed: !!existed },
    });
  } catch (e) {
    return res.status(500).json({ EC: -1, EM: e.message, DT: "" });
  }
};

export { createReviewController, getProductReviewsController, checkReviewedController };
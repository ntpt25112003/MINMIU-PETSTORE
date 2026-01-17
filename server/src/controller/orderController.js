import db from "../models/index.js";

const createOrderController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, cartItems, totalPrice } = req.body;

    if (!shippingAddressId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({
        EC: -1,
        EM: "Missing required fields",
        DT: "",
      });
    }

    // Get shipping address
    const shippingInf = await db.ShippingInf.findByPk(shippingAddressId);
    if (!shippingInf || shippingInf.userId !== userId) {
      return res.status(400).json({
        EC: -1,
        EM: "Invalid shipping address",
        DT: "",
      });
    }

    // Create order
    const order = await db.Order.create({
      userId,
      shippingAddress: shippingInf.address, 
      status: "Pending",
      totalPrice,
    });

    // Create order items
    const orderItemPromises = cartItems.map((item) => {
      const productId = item.productId || item.id;
      const price = item.price || item.product?.price || 0;

      return db.OrderItem.create({
        orderId: order.id,
        productId,
        quantity: item.quantity,
        totalPrice: price * item.quantity, 
      });
    });

    await Promise.all(orderItemPromises);

    return res.status(201).json({
      EC: 0,
      EM: "Order created successfully",
      DT: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await db.Order.findAll({
      where: { userId },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderItems: order.orderItems.map((item) => ({
        image: item.product?.image,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.product?.price,
        productId: item.productId,
      })),
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      status: order.status,
      shippingAddress: order.shippingAddress,
    }));

    return res.status(200).json({
      EC: 0,
      EM: "Get user orders successfully",
      DT: formattedOrders,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from backend",
      DT: error.message,
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "userName", "phoneNumber", "role"], 
        },
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderItems: order.orderItems.map((item) => ({
        image: item.product?.image,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.product?.price,
        productId: item.productId,
      })),
      user: order.user,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      status: order.status,
      shippingAddress: order.shippingAddress,
    }));

    return res.status(200).json({
      EC: 0,
      EM: "Get all orders successfully",
      DT: formattedOrders,
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from backend",
      DT: error.message,
    });
  }
};

const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db.Order.findByPk(id, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "userName", "phoneNumber", "role"], 
        },
        {
          model: db.OrderItem,
          as: "orderItems",
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: ["id", "name", "image", "price"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        EC: -1,
        EM: "Order not found",
        DT: "",
      });
    }

    // trả formatted cho FE dễ dùng (optional)
    const formattedOrder = {
      id: order.id,
      orderItems: order.orderItems.map((item) => ({
        image: item.product?.image,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.product?.price,
        productId: item.productId,
      })),
      user: order.user,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      status: order.status,
      shippingAddress: order.shippingAddress,
    };

    return res.status(200).json({
      EC: 0,
      EM: "Get order successfully",
      DT: formattedOrder,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        EC: -1,
        EM: "Status is required",
        DT: "",
      });
    }

    const order = await db.Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        EC: -1,
        EM: "Order not found",
        DT: "",
      });
    }

    await order.update({ status });

    return res.status(200).json({
      EC: 0,
      EM: "Order updated successfully",
      DT: order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Error from server",
      DT: error.message,
    });
  }
};

export {
  createOrderController,
  getUserOrdersController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
};

import express from "express";
import {
  userRegisterController, 
  userLoginController,
  getShippingAddressesController,
  createShippingAddressController,
  updateShippingAddressController,
  deleteShippingAddressController,
  setDefaultAddressController,
  changePasswordController,
  getUserInfoController,
  updateUserInfoController
} from "../controller/userController.js";
import {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} from "../controller/productController.js";
import {
  getAllOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  getUserOrdersController,
  createOrderController,
} from "../controller/orderController.js";
import {
  createReviewController,
  getProductReviewsController,
  checkReviewedController,
} from "../controller/reviewController.js";
import {
  consultServiceController,
  analyzePetImageController,
  calculatePriceController,
  getAvailableSlotsController,
  createAppointmentController,
  getUserAppointmentsController,
  getManagerScheduleController,
  getAllAppointmentsManagerController,
  updateAppointmentStatusController,
  cancelAppointmentController,
} from "../controller/appointmentController.js";
import upload from "../config/multer.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import requireManager from "../middleware/requireManager.js";

const router = express.Router();

// API:method + path + controller
// GET POST PUT DELETE
// read create update delete
const initApiRoutes = (app) => {
   router.post("/user",userRegisterController);
   router.post("/login",userLoginController);

   // Shipping Address routes
   router.get("/user/shipping-addresses", verifyToken, getShippingAddressesController);
   router.post("/user/shipping-address", verifyToken, createShippingAddressController);
   router.put("/user/shipping-address/:id", verifyToken, updateShippingAddressController);
   router.delete("/user/shipping-address/:id", verifyToken, deleteShippingAddressController);
   router.put("/user/set-default-address/:id", verifyToken, setDefaultAddressController);

   // Change password route
   router.put("/user/change-password", verifyToken, changePasswordController);

   // User Profile routes
   router.get("/user/info", verifyToken, getUserInfoController);
   router.put("/user/update-info", verifyToken, updateUserInfoController);

    // Product routes
   router.post("/product", upload.single('image'), createProductController);
   router.get("/products", getAllProductsController);
   router.get("/product/:id", getProductByIdController);
   router.put("/product/:id", upload.single("image"), updateProductController);
   router.delete("/product/:id", deleteProductController);
   
   // Category routes
   router.post("/category", createCategoryController);
   router.get("/category", getAllCategoriesController);
   router.put("/category/:id", updateCategoryController);
   router.delete("/category/:id", deleteCategoryController);

   // Order routes
   router.post("/order", verifyToken, createOrderController);
   router.get("/order", verifyToken, requireManager, getAllOrdersController);
   router.get("/order/:id", verifyToken, requireManager, getOrderByIdController);
   router.put("/order/:id", verifyToken, requireManager, updateOrderStatusController);
   router.get("/user/orders", verifyToken, getUserOrdersController);

   // Review routes
   router.post("/review", verifyToken, createReviewController);
   router.get("/product/:productId/reviews", getProductReviewsController);
   router.get("/review/check", verifyToken, checkReviewedController);
   
    // AI Chat & Appointment routes
    router.post("/chat/consult", consultServiceController);
    router.post("/chat/analyze-pet", upload.single("image"), analyzePetImageController);
    router.post("/chat/calculate-price", calculatePriceController);
    router.get("/appointment/slots", getAvailableSlotsController);
    router.post("/appointment", optionalAuth, createAppointmentController);
    router.get("/user/appointments", optionalAuth, getUserAppointmentsController);
    router.put("/user/appointment/:id/cancel", optionalAuth, cancelAppointmentController);

    // Manager Appointment routes
    router.get("/manager/appointments/schedule", verifyToken, requireManager, getManagerScheduleController);
    router.get("/manager/appointments", verifyToken, requireManager, getAllAppointmentsManagerController);
    router.put("/manager/appointment/:id/status", verifyToken, requireManager, updateAppointmentStatusController);

    return app.use("/api", router)
}

export default initApiRoutes
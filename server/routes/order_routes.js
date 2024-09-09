const express = require("express");
const {
  addOrder,
  cancelOrder,
  getOrder,
  getOrdersBySeller,
  updateOrderStatus,
  cancelOrderSeller,
} = require("../controllers/order_controller");
const { protect, authorize } = require("../middlewares/auth_middleware");
const { addToCart, decreasequantityfromcart, removefromcart, viewCart, increasequantityincart } = require("../controllers/cart_controller");

const router = express.Router();

router.post("/", protect, authorize("customer"), addOrder);
router.get("/", protect, authorize("customer"), getOrder);
router.post("/cart/add", protect, authorize("customer"), addToCart);
router.delete("/cart/delete/:productId", protect, authorize("customer"), removefromcart);
router.post("/cart/increase", protect, authorize("customer"), increasequantityincart);
router.post("/cart/decrease", protect, authorize("customer"), decreasequantityfromcart);
router.get("/cart",protect,authorize("customer"),viewCart);
router.patch("/cancelC/:orderId", protect, authorize("customer"), cancelOrder);
router.patch("/cancelS/:orderId", protect, authorize("seller"), cancelOrderSeller);
router.get("/seller", protect, authorize("seller"), getOrdersBySeller);
router.put("/:orderId", protect, authorize("seller"), updateOrderStatus);

module.exports = router;

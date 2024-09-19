const express = require("express");
const { protect, authorize } = require("../middlewares/auth_middleware");
const {
  checkInventory,
  getOrderSummary,
  searchProducts,
  updateProductStatus,
} = require("../controllers/seller_controller");

const router = express.Router();

router.get("/product/Inventory", protect, authorize("seller"), checkInventory);
router.get("/orders/summary", protect, authorize("seller"), getOrderSummary);
router.put("/productstatus", protect, authorize("seller"), updateProductStatus);
router.get("/searchProducts/", protect, authorize("customer"), searchProducts);
module.exports = router;

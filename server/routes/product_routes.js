const express = require("express");
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  checkInventory,
  getOrderSummary,
  getOrderDetails,
  checkdatafromstore,
  getDepartments,
  getProductsByDepartment,
  getProductsByDepartmentAndType,
  getAllProducts,
  getDepartmentsAndTypes,
} = require("../controllers/product_controller");
const { protect, authorize } = require("../middlewares/auth_middleware");
const router = express.Router();

router
  .route("/")
  .post(protect, authorize("seller"), addProduct)
  .get(protect, authorize("customer"), getAllProducts);
router.get("/departmentsandtypes", protect, authorize("customer"), getDepartmentsAndTypes );

router.get("/departments", protect, authorize("customer"), getDepartments);

router.get(
  "/:department",
  protect,
  authorize("customer"),
  getProductsByDepartment
);
router.get(
  "/:department/:type",
  protect,
  authorize("customer"),
  getProductsByDepartmentAndType
);

router
  .route("/:productId")
  .put(protect, authorize("seller"), updateProduct)
  .delete(protect, authorize("seller"), deleteProduct);

router.route("/inventory").get(protect, authorize("seller"), checkInventory);

router
  .route("/inventory/prod/:storeId/:category")
  .get(protect, checkdatafromstore);

router
  .route("/orders/summary")
  .get(protect, authorize("seller"), getOrderSummary);

router.route("/orders/summary/:orderId").get(getOrderDetails);

module.exports = router;

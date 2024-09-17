const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const { protect, authorize } = require("../middlewares/auth_middleware");

router.get("/users",protect,authorize("admin") , adminController.getSellers);
router.get("/allusers",protect,authorize("admin") , adminController.getAllUsers);
router.patch("/verify/:userId",protect, authorize("admin"), adminController.verifySeller);
router.get("/sales-reports", protect, authorize("admin"), adminController.getSalesReports);

module.exports = router;

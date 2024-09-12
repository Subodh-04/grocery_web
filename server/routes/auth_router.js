const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth_controller");
const { signupSchema, loginSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate_middleware");
const {
  updateprof,
  addAddress,
  deleteAddress,
  getparticularAddress,
  editAddress,
} = require("../controllers/user_controller");
const { protect, authorize } = require("../middlewares/auth_middleware");

router.post("/", validate(signupSchema), authController.home);
router.post("/login", validate(loginSchema), authController.login);
router.get("/user/:userId", authController.userfind);
router.post("/user/resetpass", authController.resetpassword);
router.post("/user/changepass/:resetToken", authController.changePassword);
router.post("/user/updatepass/", protect, authController.updatePassword);
router.post("/user/addAddress", protect, addAddress);
router.put("/user/update/:addressId", protect, editAddress);
router.delete("/user/delete/:addressId", protect, deleteAddress);
router.put("/user/profile", protect, updateprof);

module.exports = router;

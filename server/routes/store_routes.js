const express = require("express");
const {createStore,updateStoreDetails,getStores, findStoreById} = require("../controllers/store_controller");
const { protect, authorize } = require("../middlewares/auth_middleware");

const router = express.Router();

router.post("/", protect, authorize("seller"), createStore);
router.get("/", protect, getStores);
router.put("/:storeId", protect, authorize("seller"), updateStoreDetails);
router.get("/:storeId",protect,authorize("seller"),findStoreById);

module.exports = router;
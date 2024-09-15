require("dotenv").config();
const express = require("express");
const connectDb = require("./utils/db");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/auth_router");
const adminRoutes = require("./routes/admin_routes");
const storeRoutes = require("./routes/store_routes");
const productRoutes = require("./routes/product_routes");
const orderRoutes = require("./routes/order_routes");
const sellerRoutes = require("./routes/seller_routes");

const errorMiddleware = require("./middlewares/error_middleware");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/seller", sellerRoutes);

app.use(errorMiddleware);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`server running at port :${PORT}`);
  });
});

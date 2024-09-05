const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Store = require("../models/storeModel");

const addProduct = async (req, res) => {
  try {
    const {
      name,
      prod_img,
      type,
      description,
      price,
      quantity,
      department,
      seller,
      store,
    } = req.body;

    if (
      !name ||
      !prod_img ||
      !type ||
      !price ||
      !quantity ||
      !department ||
      !seller ||
      !store
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const storeExists = await Store.findOne({ _id: store, seller });
    if (!storeExists) {
      return res.status(400).json({
        message: "Invalid store or store does not belong to the seller",
      });
    }

    const newProduct = new Product({
      name,
      prod_img,
      type,
      description,
      price,
      quantity,
      department,
      seller,
      store,
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const groupedProducts = products.reduce((acc, product) => {
      const type = product.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(product);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: groupedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get products" });
  }
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, department, description, type, price, quantity } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { name, description, price, quantity },
      { new: true }
    );
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const hasOrders = await Order.find({ product: productId });
    if (hasOrders.length > 0) {
      return res.status(201).json({
        success: false,
        message:
          "Cannot delete the product as there are pending orders for this product.",
      });
    }
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting product:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete product due to an internal error",
      });
  }
};

const checkInventory = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    const totalProduct=await Product.countDocuments({seller:req.user._id});
    res.status(200).json({ success: true, totalProducts:totalProduct, data: products });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to check inventory" });
  }
};

const getOrderSummary = async (req, res) => {
  try {
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const orders = await Order.find({ seller: req.user._id })
      .populate({
        path: "product",
        populate: {
          path: "store",
          model: "Store",
        },
      })
      .populate("customer");

    const TotalOrders = await Order.countDocuments({ seller: req.user._id });
    const Completedorders = await Order.countDocuments({
      seller: req.user._id,
      status: "completed",
    });
    const Pendingorders = await Order.countDocuments({
      seller: req.user._id,
      status: "pending",
    });

    const orderedProducts = orders.map((order) => ({
      orderId: order._id,
      product: {
        productId: order.product._id,
        productName: order.product.name,
        productImage: order.product.prod_img,
        type: order.product.type,
        description: order.product.description,
        productPrice: order.product.price,
        sellerId: order.product.seller,
        store: {
          storeId: order.product.store ? order.product.store._id : null,
          storeName: order.product.store ? order.product.store.storeName : null,
          storeLocation: order.product.store
            ? order.product.store.storeLocation
            : null,
        },
      },
      buyer: order.customer
        ? {
            customerId: order.customer._id,
            customerName: order.customer.userName,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address,
          }
        : null,
      status: order.status,
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      orderDate: formatDate(order.createdAt),
    }));

    res.status(200).json({
      success: true,
      total: TotalOrders,
      completed: Completedorders,
      pending: Pendingorders,
      data: orderedProducts,
    });
  } catch (error) {
    console.error("Error fetching order summary:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get order summary" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Find the order by ID and populate related data (product, customer, and store)
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "product",
        populate: {
          path: "store",
          model: "Store",
        },
      })
      .populate("customer", "-password");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const orderDetails = {
      orderId: order._id,
      product: {
        productId: order.product._id,
        productName: order.product.name,
        productImage: order.product.prod_img,
        type: order.product.type,
        description: order.product.description,
        productPrice: order.product.price,
        sellerId: order.product.seller,
        store: {
          storeId: order.product.store._id,
          storeName: order.product.store.storeName,
          storeLocation: order.product.store.storeLocation,
        },
      },
      buyer: {
        customerId: order.customer._id,
        customerName: order.customer.userName,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
      },
      status: order.status,
      quantity: order.quantity,
      productPrice: order.productPrice,
      deliveryCost: order.DeliveryCost,
      totalAmount: order.totalAmount,
      orderDate: formatDate(order.createdAt),
    };

    // Send the response
    console.log(orderDetails);

    res.status(200).json({ success: true, data: orderDetails });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get order details" });
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  checkInventory,
  getOrderSummary,
  getOrderDetails,
};

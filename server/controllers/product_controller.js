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

    // Validation
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

    // Check if the store exists and belongs to the seller
    const storeExists = await Store.findOne({ _id: store, seller });
    if (!storeExists) {
      return res.status(400).json({
        message: "Invalid store or store does not belong to the seller",
      });
    }

    // Create new product
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
    const products = await Product.find().populate("seller").populate("store");

    // Get unique departments
    const categories = [
      ...new Set(products.flatMap((product) => product.department)),
    ];

    // Group products by department and type
    const groupedProducts = products.reduce((acc, product) => {
      const department = product.department;
      const type = product.type;

      if (!acc[department]) {
        acc[department] = {};
      }

      if (!acc[department][type]) {
        acc[department][type] = [];
      }

      acc[department][type].push(product);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      departments: categories,
      totalProducts: products.length,
      groupedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get products" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller").populate("store");
    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get products" });
  }
};

const getProductsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const products = await Product.find({ department })
      .populate("seller")
      .populate("store");

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this department",
      });
    }

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get products by department",
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const products = await Product.find();

    // Get unique departments
    const departments = [
      ...new Set(products.map((product) => product.department)),
    ];

    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get departments" });
  }
};

const getDepartmentsAndTypes = async (req, res) => {
  try {
    const products = await Product.find();

    // Group products by department and type
    const groupedProducts = products.reduce((acc, product) => {
      const department = product.department;
      const type = product.type;

      if (!acc[department]) {
        acc[department] = {};
      }

      if (!acc[department][type]) {
        acc[department][type] = [];
      }

      acc[department][type].push(product);
      return acc;
    }, {});

    // Convert groupedProducts object to an array of arrays
    const result = Object.entries(groupedProducts).map(
      ([department, types]) => {
        return [department, Object.keys(types)];
      }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get departments and types" });
  }
};

const getProductsByDepartmentAndType = async (req, res) => {
  try {
    const { department, type } = req.params;
    const products = await Product.find({ department, type })
      .populate("seller")
      .populate("store");

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: `No products found for ${type} in ${department}`,
      });
    }

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get products by department and type",
    });
  }
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, department, description, type, price, quantity } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { name, description, department, type, price, quantity },
      { new: true }
    )
      .populate("seller")
      .populate("store");

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
      return res.status(400).json({
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
    res.status(500).json({
      success: false,
      message: "Failed to delete product due to an internal error",
    });
  }
};

const checkdatafromstore = async (req, res) => {
  try {
    const { category, storeId } = req.params;
    const products = await Product.find({
      store: storeId,
      department: category,
    });
    const totalProduct = await Product.countDocuments({
      store: storeId,
      department: category,
    });
    const categories = products.flatMap((product) => product.department);
    const uniqueCategories = [...new Set(categories)];

    const groupedProducts = uniqueCategories.reduce((acc, category) => {
      acc[category] = products.filter((product) =>
        product.department.includes(category)
      );
      return acc;
    }, {});
    res
      .status(200)
      .json({ success: true, totalProducts: totalProduct, products });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to check inventory" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Function to format the date
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    };

    // Find the order by ID and populate related fields (product, seller, customer)
    const order = await Order.findOne({ _id: orderId })
      .populate({
        path: "products.product",
        populate: {
          path: "store",
          model: "Store",
        },
      })
      .populate("products.seller", "userName email store")
      .populate("customer", "-password");

    // Check if order exists
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Map through products to structure the product and seller details
    const productDetails = order.products.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      productImage: item.product.prod_img,
      type: item.product.type,
      description: item.product.description,
      productPrice: item.productPrice,
      quantity: item.quantity,
      seller: {
        sellerId: item.seller._id,
        sellerName: item.seller.userName,
        sellerEmail: item.seller.email,
        store: {
          storeId: item.seller.store?._id || null,
          storeName: item.seller.store?.storeName || null,
          storeLocation: item.seller.store?.storeLocation || null,
        },
      },
    }));

    // Structure the full order details
    const orderDetails = {
      orderId: order._id,
      products: productDetails,
      buyer: {
        customerId: order.customer._id,
        customerName: order.customer.userName,
        email: order.customer.email,
        phone: order.customer.phone,
        address: {
          street: order.deliveryAddress.street,
          city: order.deliveryAddress.city,
          postalCode: order.deliveryAddress.postalCode,
          country: order.deliveryAddress.country,
        },
      },
      status: order.orderStatus,
      deliveryCost: order.deliveryCost,
      totalAmount: order.totalAmount,
      paymentType: order.paymentType,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId || null, // Only for Stripe payments
      deliveryTime: {
        label: order.deliveryTime.label,
        price: order.deliveryTime.price,
        tag: order.deliveryTime.tag,
      },
      orderDate: formatDate(order.createdAt),
    };

    // Send the response with order details
    res.status(200).json({ success: true, data: orderDetails });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get order details" });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getAllProducts,
  getDepartments,
  getDepartmentsAndTypes,
  getProductsByDepartment,
  getProductsByDepartmentAndType,
  updateProduct,
  deleteProduct,
  checkdatafromstore,
  getOrderDetails,
};

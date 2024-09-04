const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Store = require("../models/storeModel");
const sendEmail = require("../services/email_service");
const { generateBill } = require("../services/bill_service");
const {
  orderEmailContent,
  orderStatusUpdateEmailContent,
  cancelOrderEmailContent,
} = require("../templates/email_template");

const addOrder = async (req, res) => {
  const { productId, quantity, deliverySlotId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough product in stock" });
    }
    const deliverySlot = await Store.findOne(
      { "deliverySlots._id": deliverySlotId },
      { "deliverySlots.$": 1 }
    );
    if (!deliverySlot || !deliverySlot.deliverySlots.length) {
      return res
        .status(404)
        .json({ success: false, message: "Delivery slot not found" });
    }

    const deliverySlotCost = deliverySlot.deliverySlots[0].cost;
    const productPrice = product.price * quantity;

    const totalAmount = productPrice + deliverySlotCost;

    const order = await Order.create({
      product: productId,
      quantity,
      customer: req.user._id,
      seller: product.seller,
      productPrice: productPrice,
      DeliveryCost: deliverySlotCost,
      totalAmount: totalAmount,
      deliverySlot: deliverySlotId,
    });

    product.quantity -= quantity;
    await product.save();

    await sendEmail(
      req.user.email,
      "Order Placed - FreshFinds",
      orderEmailContent(req.user, order, product, quantity,productPrice,deliverySlotCost, totalAmount)
    );

    const bill = await generateBill(order._id, deliverySlotCost);

    res.status(201).json({ success: true, data: order, bill: bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add order",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const Cancel = await Order.findById(orderId);

    if (!Cancel) {
      return res.status(404).json({ message: "Order not Found" });
    }

    if (Cancel.status == "cancelled") {
      return res.status(400).json({ message: "Order is already Cancelled" });
    }

    Cancel.status = "cancelled";
    await Cancel.save();
    res
      .status(200)
      .json({ message: "Order Cancelled By Customer Successfully" });
    sendEmail(
      req.user.email,
      "Order Cancelled - FreshFinds",
      cancelOrderEmailContent(req.user, orderId)
    );
  } catch (error) {
    console.log("Error While Cancelling Order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

const cancelOrderSeller = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order Doesnt Exists" });
    }
    return res
      .status(200)
      .send({ message: "Order Canceled By Seller Successfully." });
  } catch (error) {
    console.log("Internal Server Error", error);
  }
};

const getOrder = async (req, res) => {
  try {
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    };
    const orders = await Order.find({ customer: req.user._id }).populate(
      "product"
    );
    const orderData = orders.map((order) => ({
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
      totalAmount: order.totalAmount,
      orderDate: formatDate(order.createdAt),
    }));
    res.status(200).json(orderData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrdersBySeller = async (req, res) => {
  try {
    const orders = await Order.find({ "products.product.seller": req.user._id })
      .populate("products.product")
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("customer");
    console.log(updatedOrder);
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res
      .status(200)
      .send({ message: "Order Status Updated Successfully", updatedOrder });
    await sendEmail(
      updatedOrder.customer.email,
      "Order Status Updated - FreshFinds",
      orderStatusUpdateEmailContent(updatedOrder.customer, updatedOrder, status)
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addOrder,
  cancelOrder,
  cancelOrderSeller,
  getOrder,
  getOrdersBySeller,
  updateOrderStatus,
};

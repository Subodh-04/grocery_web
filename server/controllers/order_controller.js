const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const sendEmail = require("../services/email_service");
const { generateBill } = require("../services/bill_service");
const {
  orderEmailContent,
  orderStatusUpdateEmailContent,
  cancelOrderEmailContent,
} = require("../templates/email_template");
const User = require("../models/userModel");

const stripe = require("stripe")(
  "sk_test_51PzviN1hYkTOanlJkGJbY3Ssv39dEeAwDJdaMzMtozx7LymhdFvsFmb1J0YGClqmMDBwq6ss8MD4QSw1aLCoEoR300RsoBwqQ7"
);

const addOrder = async (req, res) => {
  try {
    const { items, deliveryOption, paymentMethod, deliveryAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    if (!deliveryAddress || typeof deliveryAddress !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid delivery address" });
    }

    let totalAmount = 0;
    let orderItems = [];

    // Calculate total amount and prepare order items
    for (let item of items) {
      const { productId, quantity } = item;
      const product = await Product.findById(productId);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product ${productId} not found` });
      }

      if (product.quantity < quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Not enough stock for product ${productId}`,
          });
      }

      const productPrice = product.price * quantity;
      totalAmount += productPrice;

      // Add item to order items
      orderItems.push({
        product: productId,
        quantity,
        productPrice,
        seller: product.seller,
      });

      // Update product quantity
      product.quantity -= quantity;
      await product.save();
    }

    const { label, price, tag } = deliveryOption;
    const deliveryCost = price;
    totalAmount += deliveryCost;

    // Create the order in the database
    const orderData = {
      products: orderItems,
      customer: req.user._id,
      deliveryCost,
      totalAmount,
      deliveryTime: {
        label,
        price: deliveryCost,
        tag,
      },
      paymentType: paymentMethod,
      paymentId:"123456789",
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        postalCode: deliveryAddress.postalCode,
        country: deliveryAddress.country,
      },
    };

    const order = await Order.create(orderData);

    console.log("New order object:", order);

    // Clear the user's cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    if (paymentMethod === "COD") {
      return res.json({
        success: true,
        message: "Order placed successfully with Cash on Delivery",
      });
    } else if (paymentMethod === "Stripe") {
      // Ensure each item in the items array has a valid price
      const line_items = items.map(async (item) => {
        const { productId, quantity } = item;
        const product = await Product.findById(productId);

        if (!product || !product.price || isNaN(product.price)) {
          throw new Error(`Invalid price for item: ${productId}`);
        }

        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name, // Ensure product name is available
            },
            unit_amount: Math.round(product.price * 100), // Ensure price is in correct format
          },
          quantity,
        };
      });

      // Add delivery charges
      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Charges",
          },
          unit_amount: deliveryCost * 100, // Delivery fee in the smallest currency unit
        },
        quantity: 1,
      });

      // Wait for all line items to be prepared
      const preparedLineItems = await Promise.all(line_items);

      // Ensure total amount is above minimum threshold (₹37.00)
      const totalStripeAmount = preparedLineItems.reduce(
        (total, item) => total + item.price_data.unit_amount * item.quantity,
        0
      );
      if (totalStripeAmount < 3700) {
        return res.status(400).json({
          success: false,
          message: "Total amount is too low. Minimum amount is ₹37.00",
        });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: preparedLineItems,
        mode: "payment",
        success_url: `http://localhost:5000/api/order/verify?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
        cancel_url: `http://localhost:5000/api/order/verify?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
      });

      // Update the order with the payment ID and status
      await Order.findByIdAndUpdate(order._id, {
        paymentId: session.id,
        paymentStatus: "pending", // Set to "pending" initially
      });

      // Respond with the session URL
      return res.json({ success: true, session_url: session.url });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add order",
      error: error.message,
    });
  }
};

const verifyPayment=async (req, res) => {
  const { session_id, orderId } = req.query;

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    // Check the payment status
    if (paymentIntent.status === 'succeeded') {
      // Update the order with the payment details
      await Order.findByIdAndUpdate(orderId, {
        paymentId: paymentIntent.id,
        paymentStatus: 'paid',
      });

      // Redirect to a success page
      res.redirect('http://localhost:3000/order-success');
    } else {
      res.redirect('http://localhost:3000/order-failed');
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.redirect('/order-failed');
  }
};

// Cancel order by customer
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    await sendEmail(
      req.user.email,
      "Order Cancelled - FreshFinds",
      cancelOrderEmailContent(req.user, orderId)
    );

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

// Cancel order by seller
const cancelOrderSeller = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order doesn't exist" });
    }

    await sendEmail(
      order.customer.email,
      "Order Cancelled by Seller - FreshFinds",
      cancelOrderEmailContent(order.customer, orderId)
    );

    res.status(200).json({ message: "Order cancelled by seller successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order by seller" });
  }
};

// Get customer orders
const getOrder = async (req, res) => {
  try {
    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      return `${month} ${day}, ${year}`;
    };

    // Fetch orders for the authenticated user and populate product and store details
    const orders = await Order.find({ customer: req.user._id })
      .populate({
        path: "products.product",
        populate: {
          path: "store",
          select: "storeName storeLocation",
        },
      })
      .populate("customer"); // Populate customer details if needed

    const orderData = orders.map((order) => ({
      orderId: order._id,
      products: order.products.map((productItem) => ({
        productId: productItem.product._id,
        productName: productItem.product.name,
        productImage: productItem.product.prod_img,
        description: productItem.product.description,
        productPrice: productItem.product.price,
        quantity: productItem.product.quantity,
        sellerId: productItem.product.seller,
        store: {
          storeId: productItem.product.store._id,
          storeName: productItem.product.store.storeName,
          storeLocation: productItem.product.store.storeLocation,
        },
      })),
      buyer: {
        customerId: order.customer._id,
        customerName: order.customer.userName,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      status: order.status,
      quantity: order.products.reduce((acc, item) => acc + item.quantity, 0), // Assuming you want the total quantity of products
      totalAmount: order.totalAmount,
      deliveryCost: order.deliveryCost,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime.label,
      orderDate: formatDate(order.createdAt),
    }));

    res.status(200).json(orderData);
  } catch (error) {
    console.error("Error fetching orders:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get orders for a seller
const getOrdersBySeller = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("product")
      .exec();

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("customer");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    await sendEmail(
      updatedOrder.customer.email,
      "Order Status Updated - FreshFinds",
      orderStatusUpdateEmailContent(updatedOrder.customer, updatedOrder, status)
    );

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addOrder,
  verifyPayment,
  cancelOrder,
  cancelOrderSeller,
  getOrder,
  getOrdersBySeller,
  updateOrderStatus,
};

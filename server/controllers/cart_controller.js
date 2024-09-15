const User = require("../models/userModel");

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInCart = user.cart.find(
      (item) => item._id.toString() === productId.toString()
    );
    if (productInCart) {
      productInCart.quantity += quantity;
    } else {
      user.cart.push({ _id: productId, quantity });
    }
    await user.save();

    res
      .status(200)
      .json({ message: "Product added to cart successfully", cart: user.cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const decreasequantityfromcart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInCart = user.cart.find(
      (item) => item._id.toString() === productId.toString()
    );

    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (productInCart.quantity > quantity) {
      productInCart.quantity -= quantity;
    } else {
      user.cart = user.cart.filter(
        (item) => item._id.toString() !== productId.toString()
      );
    }

    await user.save();

    res
      .status(200)
      .json({ message: "Product updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const increasequantityincart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity == null) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInCart = user.cart.find(
      (item) => item._id.toString() === productId.toString()
    );

    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    productInCart.quantity += quantity;
    await user.save();

    res
      .status(200)
      .json({ message: "Product updated successfully", cart: user.cart });
  } catch (error) {
    console.error("Error increasing quantity in cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const removefromcart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const user = await User.findById(userId);

    user.cart = user.cart.filter(
      (item) => item._id.toString() !== productId.toString()
    );
    await user.save();
    res
      .status(200)
      .send({ message: "Product removed from the cart Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server Error" });
  }
};

const viewCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "cart._id",
      model: "Product",
      select: "name price prod_img",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let totalAmount = 0;
    const cartdetails = user.cart.map((cartItem) => {
      const product = cartItem._id;
      const itemTotalPrice = product.price * cartItem.quantity;
      totalAmount += itemTotalPrice;

      return {
        productId: product._id,
        name: product.name,
        image: product.prod_img,
        price: product.price,
        quantity: cartItem.quantity,
        totalPrice: itemTotalPrice,
      };
    });

    res.status(200).json({ cart: cartdetails, totalAmount });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToCart,
  decreasequantityfromcart,
  increasequantityincart,
  removefromcart,
  viewCart,
};

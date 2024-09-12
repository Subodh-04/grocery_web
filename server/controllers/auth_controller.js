const User = require("../models/userModel");
const Store = require("../models/storeModel");
const bcrypt=require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require("../services/email_service");
const { registrationEmailContent } = require("../templates/email_template");
const { signupSchema, loginSchema } = require("../validators/auth-validator");

const home = async (req, res, next) => {
  try {
    signupSchema.parse(req.body);
    const { userName, email, phone, password, role} = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      userName,
      email,
      phone,
      password,
      role,
      verified: role == "seller" ? false : true,
    });

    res.status(201).json({
      message: "Registration successful",
      token: newUser.generateToken(),
      userId: newUser._id.toString(),
      role: newUser.role,
      verified: newUser.verified,
    });

    await sendEmail(
      newUser.email,
      "Account Registered - FreshFinds",
      registrationEmailContent(newUser)
    );
  } catch (error) {
    console.error("Error registering user:", error);
    next(error);
  }
};

const login = async (req, res) => {
  try {
    loginSchema.parse(req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    if (user.role === "seller" && !user.verified) {
      return res.status(403).json({ message: "Seller account not verified by admin" });
    }

    // Compare provided password with hashed password
    const isMatch = await user.comparePassword(password);
    if (isMatch) {
      res.status(200).json({
        message: "Login successful",
        token: user.generateToken(),
        userId: user._id.toString(),
        role: user.role,
        verified: user.verified,
        store: user.role === "seller" ? user.store : undefined,
      });
    } else {
      res.status(401).json({ message: "Invalid Email or Password" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userfind = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      userId: user._id,
      username: user.userName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      verified: user.verified,
      store: user.role === "seller" ? user.store : undefined,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetpassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email with reset link
    await sendEmail(
      user.email,
      'Password Reset - FreshFinds',
      `<p>You requested a password reset.</p>
       <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    );

    res.status(200).json({ message: 'Password reset link sent to your email address' ,token: resetToken });
  } catch (error) {
    console.error('Error during password reset request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or expired' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    user.password=newPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { home, login, userfind,resetpassword, changePassword, updatePassword };

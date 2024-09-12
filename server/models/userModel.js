const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: [
      {
        name: {
          type: String,
          required: true,
        },
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        zip: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
        isdefault: {
          type: Boolean,
          required: true,
        },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: function () {
        return this.role !== "seller";
      },
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiration: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    const saltRound = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, saltRound);
    user.password = hash;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  try {
    const token = jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        isAdmin: this.isAdmin,
        role: this.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;

const User = require("../models/userModel");
const sendEmail = require("../services/email_service");

const updateprof = async (req, res, next) => {
  const { userName, email, phone, address } = req.body;

  try {
    const updateUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        userName,
        email,
        phone,
        address,
      },
      { new: true }
    );

    if (!updateUser) {
      return res.status(400).json({ message: "User Not Found" });
    }

    return res
      .status(200)
      .json({ message: "Profile Updated Successfully", user: updateUser });

    sendEmail(
      req.user.email,
      "Profile Updated Successfully",
      updationemailbody
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, street, country, state, zip, isdefault, city } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User not Found" });
    }
    user.address.push({ name, street, country, state, zip, isdefault, city });
    await user.save();
    return res
      .status(200)
      .json({ message: "Adress Added Successfully", user: user });
  } catch (error) {
    console.log("Error while adding address:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User Not FOund." });
    }
    user.address.remove(addressId);
    await user.save();
    return res
      .status(200)
      .json({ message: "Address Deleted Successfully.", user: user });
  } catch (error) {
    console.log("error while removing addresss:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, street, country, state, zip, city, isdefault } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User Not Found." });
    }
    const address = user.address.id(addressId);
    if (!address) {
      return res.status(404).send({ message: "Address Doesnt Exists." });
    }
    if (name) address.name = name;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zip) address.zip = zip;
    if (country) address.country = country;
    if (typeof isdefault !== "undefined") address.isdefault = isdefault;

    await user.save();
    return res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    console.log("Error while updating password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  updateprof,
  addAddress,
  editAddress,
  deleteAddress,
};

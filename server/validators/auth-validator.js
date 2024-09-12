const { z } = require("zod");

const emailRegex = /^(?=.*[a-zA-Z])(?=.*\d)[^\s@]{5,40}@[^\s@]+\.[^\s@]+$/;

const addressSchema = z.object({
  street: z.string({ required_error: "Street is required" }).trim(),
  city: z.string({ required_error: "City is required" }).trim(),
  state: z.string({ required_error: "State is required" }).trim(),
  zip: z.string({ required_error: "Zip is required" }).trim(),
  country: z.string({ required_error: "Country is required" }).trim(),
});

const deliverySlotSchema = z.object({
  label: z.string({ required_error: "Slot label is required" }).trim(),
  cost: z.number({ required_error: "Slot cost is required" }).min(0, { message: "Cost must be a positive number" }),
  type: z.enum(["Paid", "Free"], { required_error: "Slot type is required" }),
});

const storeSchema = z.object({
  storeName: z.string({ required_error: "Store Name is required" }).trim(),
  storeLocation: z.string({ required_error: "Store Location is required" }).trim(),
  deliveryOptions: z.string({ required_error: "Delivery Options are required" }).trim(),
  proximity: z.string().optional(),
  categories: z.string().optional(),
  deliverySlots: z.array(deliverySlotSchema).optional(),
  pickupAvailable: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .regex(emailRegex, {
      message:
        "Email must contain both letters, numbers and valid email format.",
    })
    .email({ message: "Invalid Email Address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(24, { message: "Too Long Password" }),
});

const signupSchema = loginSchema.extend({
  userName: z
    .string({ required_error: "Name is required" })
    .trim(),
  phone: z
    .string({ required_error: "Phone is required" })
    .length(10, { message: "Phone number must be 10 digits" }),
  role: z.string({ required_error: "Role is required" }),
  store: storeSchema.optional(), // Store details are optional on registration
}).refine((data) => {
  if (data.role === "seller" && data.store) {
    return false; // Do not allow store details during seller registration
  }
  return true;
}, {
  message: "Store details should not be provided during seller registration",
  path: ["store"],
});

module.exports = { signupSchema, loginSchema };

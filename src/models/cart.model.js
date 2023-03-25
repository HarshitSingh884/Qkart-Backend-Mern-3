const mongoose = require("mongoose");
const { productSchema } = require("./product.model");
const config = require("../config/config");
const { number } = require("joi");

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection

const cartItemsSchema = mongoose.Schema(
  {
    product: { type: productSchema },
    quantity: { type: Number },
  },
  // {
  //   _id: false, //id should be there according to testcases so commented this _id:"false"
  // }
);

const cartSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    cartItems: { type: [cartItemsSchema] },
    // cartItems: [{product:productSchema,quantity:Number}],
    paymentOption: { type: String, default: config.default_payment_option },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef Cart
 */
const Cart = mongoose.model("Cart", cartSchema);

module.exports.Cart = Cart;

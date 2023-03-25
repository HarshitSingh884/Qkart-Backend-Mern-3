const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const catchAsync = require("../utils/catchAsync");
const { decodeBase64 } = require("bcryptjs");
const { use } = require("passport");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  // fetch data using email
  const userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }

  return userCart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });

  if (!cart) {
    try {
      cart = await Cart.create({
        email: user.email,
        cartItems: [],
        paymentOption: config.default_payment_option,
      });
    } catch (err) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "User cart creation failed because user already have a cart"
      );
    }
  }

  if (cart == null) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User does not have a cart"
    );
  }

  // Find the index of the cart item matching the input productId, if any.
  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  // If product not in cart, add to cart. Otherwise, throw error.
  if (productIndex == -1) {
    let product = await Product.findOne({ _id: productId });

    if (product == null) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Product doesn't exist in database"
      );
    }

    cart.cartItems.push({ product: product, quantity: quantity });
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product already in cart. Use the cart sidebar to update or remove product from cart"
    );
  }

  await cart.save();
  return cart;

  // if userCart doesnt exist for a user then create it...
  // if (!userCart) {
  //   userCart = await Cart.create({
  //     email: user.email,
  //     cartItems: [{ product: product, quantity: quantity }],
  //   });
  //   if (!userCart) {
  //     throw new ApiError(500);
  //   }
  //   return userCart;
  // }

  // const product = await Product.findOne({ _id: productId }); //product details

  // if (!product) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Product doesn't exist in database"
  //   );
  // }

  // let cartitemsArray = userCart.cartItems;
  // const productInCart = cartitemsArray.find((product) => {
  //   return product._id == productId;
  // });

  // if (productInCart != -1) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Product already in cart. Use the cart sidebar to update or remove product from cart"
  //   );
  // }

  // // cartitemsArray=[...cartitemsArray,{product:product,quantity:quantity}]
  // cartitemsArray.push({ product: product, quantity: quantity });

  // userCart.cartItems=cartitemsArray;
  // await userCart.save();
  // return userCart;
  // return await Cart.findOneAndUpdate(
  //   { email: user.email },
  //   { cartItems: cartitemsArray },
  //   { new: true }
  // );
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  let userCart = await Cart.findOne({ email: user.email });

  if (!userCart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User does not have a cart. Use POST to create cart and add a product"
    );
  }

  const product = await Product.findOne({ _id: productId });

  if (product == null) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Product doesn't exist in database"
    );
  }

  const productIndex = userCart.cartItems.findIndex(
    (obj) => obj.product._id == productId
  );

  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  // if (quantity == 0) {
  //   await deleteProductFromCart(user, productId);
  //   res.status(httpStatus.NO_CONTENT).send();
  // }

  userCart.cartItems[productIndex].quantity = quantity;

  await userCart.save();
  return userCart;

  // return await Cart.findOneAndUpdate(
  //   { email: user.email },
  //   { cartItems: UserCartItemsArray },
  //   { new: true }
  // );
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let userCart = await Cart.findOne({ email: user.email });
  if (!userCart) {

    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart.");

  }

  const productIndex = userCart.cartItems.findIndex(
    (obj) => obj.product._id == productId
  );

  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  userCart.cartItems.splice(productIndex, 1);
  await userCart.save();
  return userCart;
};

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  // console.log("checkout() USER", user);
  let userCart = await Cart.findOne({ email: user.email });
  // console.log("checkout() USERCART", userCart);
  if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }

  if (userCart.cartItems.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User cart is empty");
  }
  const isAddressSet=await user.hasSetNonDefaultAddress();
  // console.log("isAddressDefault",isAddressDefault);
  if (!isAddressSet) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User address not set");
  }


  //commenting for upate

  let orderTotal = 0;
  let initialWalletBalance=user.walletMoney;
  for (let i = 0; i < userCart.cartItems.length; i++) {
    orderTotal += userCart.cartItems[i].product.cost * userCart.cartItems[i].quantity;
  }


  if (orderTotal > user.walletMoney) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User wallet balance insufficient");
  }

  
  const finalWalletBalance = user.walletMoney - orderTotal;
  // console.log("checkout() FINALWALLETBALANCE", finalWalletBalance);
 
  user.walletMoney = finalWalletBalance;
  await user.save();
  // console.log("checkout() after USER-updtd blnc", user);
  userCart.cartItems = [];
  await userCart.save();
  // if(userCart.cartItems!=[] || user.walletMoney==initialWalletBalance){
  //   throw new ApiError(httpStatus.BAD_REQUEST, "User balance not updated or cart not cleared.");
  // }
  // console.log("checkout() after USERCART", userCart);
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};

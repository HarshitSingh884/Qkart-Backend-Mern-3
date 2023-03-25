const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserById(id)
/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserById = async (userId) => {
    // const user = await User.findById(userId);
    const user = await User.findOne({_id:userId});
    return user;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

const getUserByEmail = async (email) => {
    const response = await User.findOne({ email: email });
    return response;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */

const createUser = async (user) => {
    // const {name,email,password}=payload;
    const { email } = user;
    const emailTaken = await User.isEmailTaken(email);
    if (emailTaken) {
        throw new ApiError(httpStatus.OK, "Email already taken");
    } else {
        // const userDoc=new User(user);
        // await userDoc.save();
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(user.password, salt);
        const userDoc = await User.create({ ...user, password: hashedPassword });
        return userDoc;
    }
    // res.status(200).json(user);
};

// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
    // const userData=await User.findById(id);
    // const response={"_id":userData._id,"address":userData.address,"email":userData.email};
    // return response;
    // const response=await User.findById(id).then((Result)=> Result.select({address:1,email:1}));

    const response = await User.findOne({ _id: id }, { address: 1, email: 1 });
    // if (!response) {
    //     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    // }
    return response;


    // const data=await User.find({"_id":id}).select('address email');
    // const data=await User.find( {"_id":id} , { address:1 , email:1} );
    // const data=await User.find({"_id":id},'address email').exec();
    // if(!data){
    //     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    // }

    // return data;
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
const setAddress = async (user, newAddress) => {
    user.address = newAddress;
    await user.save();

    return user.address;
};

module.exports = {
    getUserById,
    createUser,
    getUserByEmail,
    getUserAddressById,
    setAddress,
};

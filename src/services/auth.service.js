const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
// const User=require("../models");
// const UserInstance=new User();
/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  // const isPasswordCorrect=await UserInstance.isPasswordMatch(password);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, "Incorrect email or password");
  }

  return user;
};

// this func created by me when i wasnt able to call the user Schema method.
// const verifyCredentials=async(user,password)=>{
//   console.log("verifyCredentials" +"user: ",user +"password:",password);
//   const isPwdCorrect=await bcrypt.compare(password,user.password);
//   console.log("isPasswordCorrect  ",isPwdCorrect);
//   return isPwdCorrect ;

// }

module.exports = {
  loginUserWithEmailAndPassword,
};

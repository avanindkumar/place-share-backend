const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }
  res.json(users.map((user) => user.toObject({ getters: true })));
};
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid data found please check your data", 422)
    );
  }
  const { name, email, password } = req.body;
  let existingEmail;
  try {
    existingEmail = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (existingEmail) {
    return next(new HttpError("Email Already exist", 401));
  }
  const newUser = new User({
    name,
    email,
    password,
    image:
      "https://images.hindustantimes.com/img/2021/12/20/1600x900/6cd32fe4-61a2-11ec-8bb7-69f77148494e_1640011166463.jpg",
    places: [],
  });
  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }
  res.json(newUser.toObject({ getters: true }));
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingEmail;
  try {
    existingEmail = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (!existingEmail) {
    return next(new HttpError("Email do not exist. Plz SignUp", 401));
  }
  if (existingEmail.password !== password) {
    throw new HttpError("Email id or Password mismatch", 401);
  }
  return res.status(200).json("Login Success");
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;

const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  res.json({ user: newUser.id, email: newUser.email, token: token });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingEmail;
  try {
    existingEmail = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (!existingEmail) {
    return next(new HttpError("Email do not exist. Plz SignUp", 401));
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingEmail.password);
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (!isValidPassword) {
    return next(new HttpError("Email id or Password mismatch", 403));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingEmail.id, email: existingEmail.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  return res.status(200).json({
    userId: existingEmail.id,
    email: existingEmail.email,
    token: token,
  });
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;

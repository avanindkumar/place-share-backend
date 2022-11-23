const { v4: uuid } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Avanind",
    image:
      "https://media.istockphoto.com/id/1164329797/photo/hindu-sadhu-sitting-on-a-boat-overlooking-varanasi-city-architecture-at-sunset.jpg?s=612x612&w=0&k=20&c=LbpIHRo7kGT7dbUr6b6UuD1d6P0yCaKZ2lbqo3TY988=",
    places: 3,
  },
];
const getAllUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};
const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid data found please check your data", 422);
  }
  const { name, email, password } = req.body;
  const existingEmail = DUMMY_USERS.find((u) => u.email === email);
  if (existingEmail) {
    throw new HttpError("Email Already exist", 401);
  }
  const id = uuid();
  const newUser = {
    id,
    name,
    email,
    password,
  };
  USERS.push(newUser);
  res.json({ newUser });
};
const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = USERS.find((u) => u.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Email id or Password mismatch", 401);
  }

  return res.status(200).json("Login Success");
};

exports.getAllUsers = getAllUsers;
exports.signup = signup;
exports.login = login;

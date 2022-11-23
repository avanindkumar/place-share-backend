const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/Place");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid data found please check your data", 422);
  }
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://images.hindustantimes.com/img/2021/12/20/1600x900/6cd32fe4-61a2-11ec-8bb7-69f77148494e_1640011166463.jpg",
    creator,
  });
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating places failed", 500));
  }
  if (!user) {
    return next(new HttpError("User not found in DB", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating places failed", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const getPlacesById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong with database", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find a palces for provided id.", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlaceByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let usersPlaces;
  try {
    usersPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (!usersPlaces || usersPlaces.places.length === 0) {
    return next(new HttpError("Could not find any palce for uid.", 404));
  }
  res.json({
    places: usersPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid data found please check your data", 422);
  }
  const placeId = req.params.pid;
  const { title, description } = req.body;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }

  res.status(200).json(place.toObject({ getters: true }));
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError("Something went wrong with database", 500));
  }
  if (!place) {
    return next(new HttpError("Could not find the place by id", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong could not delete the palce", 500)
    );
  }
  res.json({ message: "Place Deleted" });
};

exports.getPlaceById = getPlacesById;
exports.getPlacesByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
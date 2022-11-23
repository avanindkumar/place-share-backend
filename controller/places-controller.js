const { v4: uuid } = require("uuid");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/Place");
const { default: mongoose } = require("mongoose");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Shri Kashi Vishwanath Temple",
    description:
      "Landmark riverside temple to Shiva, known for its 18th-century gold-plated spire and sacred well.",
    imageUrl:
      "https://img.republicworld.com/republic-prod/stories/promolarge/xhdpi/5ntgsglgvpgb6x0v_1639378537.jpeg",
    address: "Lahori Tola, Varanasi, Uttar Pradesh 221001",
    location: {
      lat: 25.3108532,
      lng: 82.9777193,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Shri Kashi Vishwanath Temple",
    description:
      "Landmark riverside temple to Shiva, known for its 18th-century gold-plated spire and sacred well.",
    imageUrl:
      "https://img.republicworld.com/republic-prod/stories/promolarge/xhdpi/5ntgsglgvpgb6x0v_1639378537.jpeg",
    address: "Lahori Tola, Varanasi, Uttar Pradesh 221001",
    location: {
      lat: 25.3108532,
      lng: 82.9777193,
    },
    creator: "u2",
  },
];

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

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const usersPlaces = DUMMY_PLACES.find((p) => p.creator === userId);
  if (!usersPlaces) {
    return next(new HttpError("Could not find any palce for uid.", 404));
  }
  res.json({ usersPlaces });
};
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
  try {
    await createdPlace.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating places failed", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid data found please check your data", 422);
  }
  const placeid = req.params.pid;
  const { title, description } = req.body;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeid) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeid);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};
const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find the Place", 404);
  }
  const filteredPlaces = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.json(filteredPlaces);
};

exports.getPlaceById = getPlacesById;
exports.getPlacesByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;

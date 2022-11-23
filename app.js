const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Location not found", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error has occured" });
});

mongoose
  .connect(
    `mongodb+srv://avanindkumar:REOdmUHrlIVEsD8b@cluster0.ikmwvvw.mongodb.net/places?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("http://localhost:5000/");
    });
  })
  .catch(() => {
    console.log("Unable to connect to database");
  });

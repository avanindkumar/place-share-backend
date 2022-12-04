const HttpError = require("../models/http-error");

const axios = require("axios");
const getCoordsForAddress = async (address) => {
  const response = await axios.get(
    `http://api.positionstack.com/v1/forward?access_key=${process.env.COORDINATES_API_KEY}&query=${address}&output=json`,
    {
      headers: {
        "Accept-Encoding": "application/json",
      },
    }
  );
  const data = response.data;
  if (!data || data.error) {
    throw new HttpError(
      `Could not find the location for the specified address code ${data.error.code}`,
      404
    );
  }
  const lat = data.data[0].latitude;
  const lng = data.data[0].longitude;
  return { lng, lat };
};

exports.getCoordsForAddress = getCoordsForAddress;

const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema({
  stationName: {
    type: String,
    required: true,
  },
  stationAddress: {
    type: String,
    required: true,
  },
  stationType: {
    type: String,
    required: true,
  },
  chargingPoints: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  stationMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StationMasters",
  },
});

stationSchema.index({ location: "2dsphere" });

stationSchema.statics.findOneByCoordinates = function (coordinates) {
  return this.findOne({
    "location.coordinates": coordinates,
  });
};

var stationModel = mongoose.model("Stations", stationSchema);
module.exports = stationModel;

const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  stationMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StationMasters",
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add any other post-related fields
});

const CommunityPostModel = mongoose.model("CommunityPost", communityPostSchema);
module.exports = CommunityPostModel;

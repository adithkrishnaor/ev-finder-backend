const Express = require("express");
const Cors = require("cors");
const Mongoose = require("mongoose");
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/user");
const stationMasterModel = require("./models/stationMasters");
const stationModel = require("./models/stations");
const bookingModel = require("./models/booking");
const CommunityPostModel = require("./models/posts");

const app = Express();
app.use(Express.json());
app.use(Cors());

Mongoose.connect(
  "mongodb+srv://adith:adith@cluster0.7mlz85p.mongodb.net/ev-app-db?retryWrites=true&w=majority&appName=Cluster0"
);

//User Sign Up

app.post("/signup", (req, res) => {
  let input = req.body;
  let hashedPassword = Bcrypt.hashSync(req.body.password, 10);
  console.log(hashedPassword);
  req.body.password = hashedPassword;

  userModel
    .find({ email: req.body.email })
    .then((data) => {
      //console.log(data)
      if (data.length > 0) {
        res.json({ status: "email already exist" });
      } else {
        let result = new userModel(input);
        result.save();
        res.json({ status: "success" });
      }
    })
    .catch((error) => {
      res.json({ error: error });
    });
});

// Unified Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await userModel.findOne({ email });
    let userType = "user";

    if (!user) {
      user = await stationMasterModel.findOne({ email });
      userType = "stationMaster";
    }

    if (!user) {
      return res.json({ status: "Invalid Email" });
    }

    const passwordValidator = Bcrypt.compareSync(password, user.password);
    if (!passwordValidator) {
      return res.json({ status: "Invalid Password" });
    }

    const token = jwt.sign(
      { email, userType },
      userType === "user" ? "evApp" : "evAppMas",
      { expiresIn: "1d" }
    );

    console.log("Login success:", { userType, userId: user._id }); // Debug log

    res.json({
      status: "success",
      token,
      userId: user._id,
      userType,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Remove or comment out the old /signin and /stationLogin endpoints
// ...rest of existing code...

//Station Master Sign Up

app.post("/stationSignUp", (req, res) => {
  let input = req.body;
  let hashedPassword = Bcrypt.hashSync(req.body.password, 10);
  console.log(hashedPassword);
  req.body.password = hashedPassword;

  stationMasterModel
    .find({ email: req.body.email })
    .then((data) => {
      //console.log(data)
      if (data.length > 0) {
        res.json({ status: "email already exist" });
      } else {
        let result = new stationMasterModel(input);
        result.save();
        res.json({ status: "success" });
      }
    })
    .catch((error) => {
      res.json({ error: error });
    });
});

// Add Station
app.post("/addStation", async (req, res) => {
  try {
    const { stationMasterId, location, ...otherData } = req.body;

    const existingStation = await stationModel.findOneByCoordinates(
      location.coordinates
    );

    if (existingStation) {
      res.json({ status: "Station already exists" });
      return;
    }

    const newStation = new stationModel({
      ...otherData,
      stationMaster: stationMasterId,
      location,
    });
    await newStation.save();
    res.json({ status: "success" });
    console.log("Station added successfully");
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

// Get All Stations
app.get("/getAllStations", async (req, res) => {
  try {
    let result = await stationModel.find();
    res.json(result);
  } catch (error) {
    res.json({ error: error });
  }
});

app.post("/createBooking", async (req, res) => {
  const { userId, stationId, bookingDate, timeSlot, vehicleNumber } = req.body;
  // Check if slot is available
  try {
    const existingBooking = await bookingModel.findOne({
      station: stationId,
      bookingDate: bookingDate,
      timeSlot: timeSlot,
      status: "confirmed",
    });

    if (existingBooking) {
      res.json({ status: "slot_unavailable" });
      return;
    }

    const newBooking = new bookingModel({
      user: userId,
      station: stationId,
      bookingDate: bookingDate,
      timeSlot,
      vehicleNumber,
    });
    await newBooking.save();
    res.json({ status: "success", bookingId: newBooking._id });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: error });
  }
});

// Get user's booking history
app.get("/userBookings/:userId", async (req, res) => {
  try {
    // Validate userId
    if (!req.params.userId) {
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    const bookings = await bookingModel
      .find({ user: req.params.userId })
      .populate("station", "stationName stationAddress")
      .sort({ date: -1 });

    // Send empty array if no bookings found
    if (!bookings || bookings.length === 0) {
      return res.json([]);
    }

    return res.json(bookings);
  } catch (error) {
    // Proper error response with status code
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      error: "Failed to fetch bookings",
      details: error.message,
    });
  }
});

//station master stations
app.get("/stationMasterStations/:stationMasterId", async (req, res) => {
  try {
    const { stationMasterId } = req.params;

    if (!stationMasterId) {
      console.log("Station Master ID is required");
      return res.status(400).json({ error: "Station Master ID is required" });
    }

    const stations = await stationModel.find({
      stationMaster: stationMasterId,
    });

    if (!stations || stations.length === 0) {
      console.log("No stations found for station master ID:", stationMasterId);
      return res.json([]);
    }

    console.log(
      `Found ${stations.length} stations for station master ID: ${stationMasterId}`
    );
    return res.json(stations);
  } catch (error) {
    console.error("Error in /stationMasterStations:", error);
    return res.status(500).json({
      error: "Failed to fetch stations",
      details: error.message,
    });
  }
});

// Get station's booking history
app.get("/stationBookings/:stationId", async (req, res) => {
  try {
    const { stationId } = req.params;

    if (!stationId) {
      return res.status(400).json({ error: "Station ID is required" });
    }

    const bookings = await bookingModel
      .find({ station: stationId })
      .populate("user", "name email phone")
      .sort({ date: -1 });

    if (!bookings || bookings.length === 0) {
      console.log("No bookings found for station ID:", stationId);
      return res.json([]);
    }

    console.log(
      `Found ${bookings.length} bookings for station ID: ${stationId}`
    );
    return res.json(bookings);
  } catch (error) {
    console.error("Error in /stationBookings:", error);
    return res.status(500).json({
      error: "Failed to fetch station bookings",
      details: error.message,
    });
  }
});

// Update booking status
app.patch("/bookings/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be confirmed, completed, or cancelled",
      });
    }

    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      status: "success",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      error: "Failed to update booking status",
      details: error.message,
    });
  }
});

// Get all community posts
app.get("/community", async (req, res) => {
  try {
    const posts = await CommunityPostModel.find()
      .populate("user", "name")
      .populate("stationMaster", "fullName");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
});

// Create a new community post
app.post("/community", async (req, res) => {
  const { userId, content } = req.body;

  try {
    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new community post
    const newPost = new CommunityPostModel({
      user: userId,
      content,
    });
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.error("Error creating community post:", error);
    res.status(500).json({ error: "Failed to create community post" });
  }
});

// Create a new community post for station Master
app.post("/communityStationMaster", async (req, res) => {
  const { stationMasterId, content } = req.body;

  try {
    // Check if the user exists
    const stationMaster = await stationMasterModel.findById(stationMasterId);
    if (!stationMaster) {
      return res.status(404).json({ error: "Station Master not found" });
    }

    // Create a new community post for Station Master
    const newPost = new CommunityPostModel({
      stationMaster: stationMasterId,
      content,
    });
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.error("Error creating community post:", error);
    res.status(500).json({ error: "Failed to create community post" });
  }
});

//port
app.listen(8080, () => {
  console.log("Server Started");
});

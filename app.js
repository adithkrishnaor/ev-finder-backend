const Express = require("express");
const Cors = require("cors");
const Mongoose = require("mongoose");
const Bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/user");
const stationMasterModel = require("./models/stationMasters");
const stationModel = require("./models/stations");

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

//User Sign In

app.post("/signin", (req, res) => {
  //let input = req.body
  userModel
    .find({ email: req.body.email })
    .then((data) => {
      if (data.length > 0) {
        const passwordValidator = Bcrypt.compareSync(
          req.body.password,
          data[0].password
        );
        if (passwordValidator) {
          jwt.sign(
            { email: req.body.email },
            "evApp",
            { expiresIn: "1d" },
            (error, token) => {
              if (error) {
                res.json({ status: "error" });
              } else {
                res.json({
                  status: "success",
                  token: token,
                  userId: data[0]._id,
                });
              }
            }
          );
        } else {
          res.json({ status: "Invalid Password" });
        }
      } else {
        res.json({ status: "Invalid Email" });
      }
    })
    .catch();
});

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

//Station Master Login

app.post("/stationLogin", (req, res) => {
  stationMasterModel
    .find({ email: req.body.email })
    .then((data) => {
      if (data.length > 0) {
        const passwordValidator = Bcrypt.compareSync(
          req.body.password,
          data[0].password
        );
        if (passwordValidator) {
          jwt.sign(
            { email: req.body.email },
            "evAppMas",
            { expiresIn: "1d" },
            (error, token) => {
              if (error) {
                res.json({ status: "error" });
              } else {
                res.json({
                  status: "success",
                  token: token,
                  stationMasterId: data[0]._id,
                });
              }
            }
          );
        } else {
          res.json({ status: "Invalid Password" });
        }
      } else {
        res.json({ status: "Invalid Email" });
      }
    })
    .catch();
});

//Add Station
app.post("/addStation", async (req, res) => {
  try {
    const { location, ...otherData } = req.body;

    const existingStation = await stationModel.findOneByCoordinates(
      location.coordinates
    );

    if (existingStation) {
      res.json({ status: "Station already exists" });
      return;
    }

    const newStation = new stationModel({
      ...otherData,
      location,
    });
    await newStation.save();
    res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

//Get All Stations
app.get("/getAllStations", async (req, res) => {
  try {
    let result = await stationModel.find();
    res.json(result);
  } catch (error) {
    res.json({ error: error });
  }
});

//port
app.listen(8080, () => {
  console.log("Server Started");
});

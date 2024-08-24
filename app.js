const Express = require("express")
const Cors = require("cors")
const Mongoose = require("mongoose")
const Bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

let app = Express()

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.listen(8080, () => {
    console.log("Server Started");
})
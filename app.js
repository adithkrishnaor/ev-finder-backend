const Express = require("express")
const Cors = require("cors")
const Mongoose = require("mongoose")
const Bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userModel = require("./models/user")

const app = Express()
app.use(Express.json())
app.use(Cors())

Mongoose.connect("mongodb+srv://adith:adith@cluster0.7mlz85p.mongodb.net/ev-app-db?retryWrites=true&w=majority&appName=Cluster0")

app.post("/signup", (req, res) => {

    let input = req.body
    let hashedPassword = Bcrypt.hashSync(req.body.password, 10)
    console.log(hashedPassword)
    req.body.password = hashedPassword

    userModel.find({email: req.body.email }).then(
        (items) => {
            //console.log(items)
            if (items.length > 0) {
                res.json({ "status": "email already exist" })
            }
            else {
                let result = new userModel(input)
                result.save()
                res.json({"status":"success"})
            }
        }
    ).catch(
        (error) => { }
    )

})

app.listen(8080, () => {
    console.log("Server Started");
})
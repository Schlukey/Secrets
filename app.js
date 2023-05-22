const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set(express.static("public"));

mongoose.connect(process.env.STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;

 userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"],
});
const Logins = new mongoose.model('logins', userSchema);
let loginFailed;

app.get("/", async (req, res) => {
  res.render("home");
});

app
  .route("/register")
  .get(async (req, res) => {
    res.render("register");
  })

  .post(async (req, res) => {
    //define the login params
    const loginParams = new Logins({
      email: req.body.username,
      password: req.body.password,
    });
    //save that into a doc on the db
    const response = await loginParams
      .save()
      .then(() => {
        console.log("new user added to db");
        res.redirect("login");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("register");
      });
    return response;
  });

app
  .route("/login")
  .get(async (req, res) => {
    res.render("login", { loginFailed });
    loginFailed = false;
  })

  .post(async (req, res) => {
    //define search params
    const userLogin = {
      email: req.body.username,
      password: req.body.password,
    };
    //check the db to find the matching document
    const response = await collection
      .findOne(userLogin)
      .then((user) => {
        if (user.password === userLogin.password) {
          console.log("match found");
          res.redirect("secrets");
        }
      })
      .catch((err) => {
        loginFailed = true;
        console.log(`Passowrd / Email not valid: ${err}`);
        res.redirect("login");
      });
    return response;
  });

app
  .route("/secrets")
  .get(async (req, res) => {
    res.render("secrets");
  })

  .post(async (req, res) => {});

app
  .route("/submit")
  .get(async (req, res) => {
    res.render("submit");
  })

  .post(async (req, res) => {
    const userPost = { secret: req.body.secret };
    const posts = mongoose.model("posts");
    const response = await posts
      .insertOne(userPost)
      .then(() => {
        res.redirect("secrets");
        console.log(`post saved: ${userPost}`);
      })
      .catch((err) => {
        console.log(err);
        res.redirect("submit");
      });
    return response;
  });

app.listen(port, () => {
  console.log("we're live");
});

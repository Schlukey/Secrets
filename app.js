require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const port = process.env.PORT;
const app = express();

mongoose.set("strictQuery", false);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: `${process.env.SECRET}`,
    resave: false,
    saveUninitialized: false,
    cookie: {},
  })
);

//using passport package to initialize and uses session package
app.use(passport.initialize());
app.use(passport.session());

async function main() {
  await mongoose.connect(`${process.env.STRING}`); //here we need to give the db name (eg : userDB)
}
main().catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done)=>{
  done(null, user.id);
});

passport.deserializeUser((id, done)=>{
  User.findById(id).then((user)=>{
    done(user);
  }).catch((err)=>{
    console.log(err);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_SECTET,
      callbackURL: "http://localhost:4200/auth/google/serets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, (err, user)=>{
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/auth/google", async (req, res) => {
  passport.authenticate("google", { scope: ["profile"] });
});

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" })
),
  async (req, res) => {
    res.redirect("/secrets");
  };

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", async(req, res)=>{
  const response = await User.find({"secret": {$ne: null}}).then((err, foundUsers)=>{
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
  return response;
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.register({ username: username }, password)
    .then(() => {
      const authenticate = passport.authenticate("local");
      authenticate(req, res, () => {
        res.redirect("/secrets");
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/register");
    });
});

app.post("/login", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(newUser, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.get("/submit", (req, res) => {
  res.render("submit");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log("server running");
});

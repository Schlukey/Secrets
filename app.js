const express = require("express");
const app = express();
const dotenv = require("dotenv");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const { MongoClient } = require('mongodb')

const port = 4200;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set(express.static("public"));

//connect to the db
const uri = `mongodb://localhost:27017/secretsDB`
const client = new MongoClient(uri);
const db = new client.db('SecretsLog');
const collection = new client.collection('logins');
app.get("/", async (req, res) => {
  res.render("home");
});

app
  .route("/login")
  .get(async (req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    //define search params
    const userLogin = {
      email: req.body.username,
      password: req.body.password,
    };
    //check the db to find the matching document
    const response = await Collection.findOne(userLogin).then((user)=>{
        console.log('match found')
        res.redirect('secrets')
    }).catch((err)=>{
        console.log(err);
        res.redirect('login');
    })
  });

app
  .route("/register")
  .get(async (req, res) => {
    res.render("register");
  })
  .post(async (req, res) => {
    //define the login params
    const loginParams = {
      email: req.body.username,
      password: req.body.password,
    };
    //save that into a doc on the db
    const response = await db.collection.save(loginParams).then(()=>{
        console.log('new user added to db');
        res.redirect('login');
    }).catch((err)=>{
        console.log(err);
        res.redirect('register');
    })
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
  .post(async (req, res) => {});

app.listen(port, () => {
  console.log("we're live");
});
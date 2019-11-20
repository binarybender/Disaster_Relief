var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    User = require("./models/user"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

const sendMail = require('./mail.js');
const path = require('path');
var url = require('url');

mongoose.connect("mongodb://localhost/disaster_relief");

var app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/images',express.static("./images"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
  secret: "Jai Shri Ram",
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({
extended : false
}));
app.use(express.json()) ;

app.post('/email' , (req , res) => {

const{subject , email, text , name} = req.body ;
console.log('Data : ' , req.body) ;
// ///////////
// mongoose.connect("mongodb://localhost/mails")
//var o = JSON.parse(req.body);

sendMail(email , subject , text, name,  function(err , data){
if(err){
	res.status(500).json({message:'Internal Error'});
}
else{
	res.json({message : 'Sentt!!!!!'}) ;
}
});
res.json({message : 'Message Received ! '})

});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// All pages ROUTES
// ======================
app.get("/",function(req,res){
  res.render("index");
});
app.get("/userlogin",function(req,res){
  res.render("userlogin");
});
app.get("/adminlogin",function(req,res){
  res.render("adminlogin");
});
app.get("/signup",function(req,res){
  res.render("signup", {err: ''});
});
app.get("/contribute", isLoggedIn, function(req,res){
  res.render("contribute", {username: username});
});

app.get("/clothes", isLoggedIn, function(req,res){
  res.render("clothes", {username: username});
});
app.get("/medicines", isLoggedIn, function(req,res){
  res.render("medicines", {username: username});
});
app.get("/foods", isLoggedIn, function(req,res){
  res.render("foods", {username: username});
});

// ======================
// Login
// ======================

//handle sign up Submit

app.post("/signup",function(req,res){
  User.register(new User({username: req.body.username, fname: req.body.fname, lname: req.body.lname, email: req.body.email, phno: req.body.phno, address: req.body.address}), req.body.password, function(err,user){
    if(err)
    {
      console.log(err);
      res.render('signup', {err: err.message});
    }
    else{
      res.render('signup', {err: 'success'});
    }
  });
});

// Login handle
var username;
app.post("/userlogin", passport.authenticate("local", {
  failureRedirect: "/userlogin"
}),function(req,res){
  username = req.user.username;
  res.redirect("/userhome");
});


//Logout
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

// check isLoggedIn middleware
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/userlogin");
}

// Disaster list NewsAPI

app.get('/userhome'  , (req , res) => {

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bfd97b0dd88e4dcdaee9bce3ef08d477');
// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them

// To query /v2/everything
// You must include at least one q, source, or domain
okay =0 ;
newsapi.v2.topHeadlines({
  q: 'flood' ,
  //sources: 'bbc-news,the-verge',
 // domains: 'bbc.co.uk, livescience.com',
  from: '2019-10-20',
  to: '2019-11-15',
  language: 'en',

  sortBy: 'relevancy',

}).then(response => {

  okay = JSON.parse(JSON.stringify(response))
  console.log('Articles is ')

  res.render("userhome", {username: username})
  // res.send("<b>"+response['articles'][0]['url']+"</b>")
  // res.send('index1.html')

  /*
    {
      status: "ok",
      articles: [...]
    }
  */
});

});

process.env["NODE_TLS_REJECT_UNAUTHORIZED"]=0;

app.listen(3000,function(){
  console.log("Server running on port 3000...");
});

var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    User = require("./models/user"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    MongoClient = require('mongodb').MongoClient ,
    passportLocalMongoose = require("passport-local-mongoose");

const sendMail = require('./mail.js');
const path = require('path');
var url = require('url');

mongoose.connect("mongodb://localhost/disaster_relief");
var db = mongoose.connection;

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
app.get("/adminhome",function(req,res){
  res.render("adminhome");
});

app.get("/signup",function(req,res){
  res.render("signup", {err: ''});
});
app.get("/contribute", isLoggedIn, function(req,res){
  res.render("contribute", {username: username});
});

app.get("/clothes", isLoggedIn, function(req,res){
  res.render("clothes", {username: username, err: '', id: ''});
});
app.get("/medicines", isLoggedIn, function(req,res){
  res.render("medicines", {username: username, err: '',id: ''});
});
app.get("/foods", isLoggedIn, function(req,res){
  res.render("foods", {username: username, err: '', id: ''});
});

var res1=[];
var res2=[];
var res3=[];
app.get("/mycontributions", isLoggedIn, function(req,res){
    res.render("mycontributions", {username: username});
});

app.get("/mycontributionsclothes", isLoggedIn, function(req,res){
  db.collection("clothes").find({name: username}).toArray(function(err, result){
    if (err) throw err;
    res.render("mycontributionsclothes", {username: username, result: result});
  });
});
app.get("/mycontributionsfood", isLoggedIn, function(req,res){
  db.collection("food").find({name: username}).toArray(function(err, result){
    if (err) throw err;
    res.render("mycontributionsfood", {username: username, result: result});
  });
});
app.get("/mycontributionsmeds", isLoggedIn, function(req,res){
  db.collection("meds").find({name: username}).toArray(function(err, result){
    if (err) throw err;
    res.render("mycontributionsmeds", {username: username, result: result});
  });
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
  if(username == "jon") {
    res.redirect("/userlogin")
  }
  else {
    res.redirect("/userhome");
  }
});
app.post("/adminlogin", passport.authenticate("local", {
  failureRedirect: "/adminlogin"
}),function(req,res){
  username = req.user.username;
  if(username == "jon") {
    res.redirect("/adminhome")
  }
  else {
    res.redirect("/adminlogin");
  }
});


app.post("/clothes", function(req, res){
  var doc = req.body;
  var id = String(parseInt(Math.random()*10000));
  doc.name = username;
  console.log(doc);
  finaldoc={}
  finaldoc.uid = id;
  finaldoc.date = Date();
  finaldoc.received = true;
  var notEmpty = 0;
  for(var key in doc)
  {
    if(doc[key]!="" && doc[key]!="Submit")
    finaldoc[key]=doc[key];
    if(doc[key]!="" && key!="name" && key!="submit")
      notEmpty++;
  }
  if((doc["othername"]!="" && doc["othervalue"]=="") || (doc["othervalue"]!="" && doc["othername"]==""))
  notEmpty=0;
  if(notEmpty)
  {
    db.collection("clothes").insertOne(finaldoc, function(err, data){
      if (err)
        console.log(err);
      else{
        res.render('clothes', {username: username,err: 'success', id: id});
        console.log("1 document inserted");
      }
    });
  }
  else {
    res.render('clothes', {username: username,err: 'fail', id: id});
  }

});

app.post("/food", function(req, res){
  var doc = req.body;
  var id = String(parseInt(Math.random()*10000));
  doc.name = username;
  console.log(doc);
  finaldoc={}
  finaldoc.uid = id;
  finaldoc.date = Date();
  finaldoc.received = true;
  var notEmpty = 0;
  for(var key in doc)
  {
    if(doc[key]!="" && doc[key]!="Submit")
    finaldoc[key]=doc[key];
    if(doc[key]!="" && key!="name" && key!="submit")
      notEmpty++;
  }
  if(notEmpty)
  {
    db.collection("food").insertOne(finaldoc, function(err, data){
      if (err) console.log(err);
      res.render('foods', {username:username,err: 'success', id: id});
      console.log("1 document inserted");
    });
  }
  else {
    res.render('foods', {username:username,err: 'fail', id: id});
  }

});
app.post("/meds", function(req, res){
  var doc = req.body;
  var id = String(parseInt(Math.random()*10000));
  doc.name = username;
  console.log(doc);
  finaldoc={}
  finaldoc.uid = id;
  finaldoc.date = Date();
  finaldoc.received = true;
  var notEmpty = 0;
  for(var key in doc)
  {
    if(doc[key]!="" && doc[key]!="Submit")
      finaldoc[key]=doc[key];
    if(doc[key]!="" && key!="name" && key!="submit")
      notEmpty++;
  }
  console.log(notEmpty);
  if((doc["othername"]!="" && doc["othervalue"]=="") || (doc["othervalue"]!="" && doc["othername"]==""))
  notEmpty=0;
  if(notEmpty)
  {
    db.collection("meds").insertOne(finaldoc, function(err, data){
      if (err) console.log(err);
      res.render('medicines', {username: username,err: 'success', id: id});
      console.log("1 document inserted");
    });
  }
  else
  {
    res.render('medicines', {username: username,err: 'fail', id: id});
  }

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

app.get('/userhome'  , isLoggedIn, (req , res) => {

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bfd97b0dd88e4dcdaee9bce3ef08d477');
// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them

// To query /v2/everything
// You must include at least one q, source, or domain
// okay =0 ;
// newsapi.v2.topHeadlines({
//   q: 'flood' ,
//   //sources: 'bbc-news,the-verge',
//  // domains: 'bbc.co.uk, livescience.com',
//   from: '2019-10-20',
//   to: '2019-11-15',
//   language: 'en',
//
//   sortBy: 'relevancy',
//
// }).then(response => {
//
//   okay = JSON.parse(JSON.stringify(response))
//   console.log('Articles is ')

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

process.env["NODE_TLS_REJECT_UNAUTHORIZED"]=0;

app.post('/email' , (req , res) => {
var url1 = "mongodb://localhost:27017/";
const{subject , email, text , name} = req.body ;
// console.log('SUBJECT '+subject) ;
console.log('Data : ' , req.body) ;
//Beginning of mongo db - connection
MongoClient.connect(url1 , function(err , db){
if(err)
    throw err ;
var dbo = db.db("disaster_relief") ;
var myObj = req.body ;
if(subject!="admin's response" && subject!="Altrueon Support")
dbo.collection("mail").insertOne(myObj , function(err , res){

if(err)
    throw err ;
console.log('One doc inserted') ;
});
});


app.post('/delete' , (req, res) => {
var url1 = "mongodb://localhost:27017/";
const{subject , email, text , name} = req.body ;
console.log('Data to be deleted '+req.body) ;
MongoClient.connect(url1 , function(err , db){
var myObj = req.body ;
var dbo = db.db("disaster_relief");
dbo.collection("mail").deleteOne(myObj , function(err , res){
if(!err)
      console.log('Delete has been done succesfully' , res.result.n)
else
      console.log('Some issue '+err)
});
});
});

sendMail(email , subject , text, name,  function(err , data){
if(err){
	res.status(500).json({message:'Internal Error'});

}
else{

	res.json({message : 'Sentt!!!!!'}) ;
}
});
res.json({message : 'Message Received ! '});
});

app.post('/editable' , (req , res) => {
var url1 = "mongodb://localhost:27017/";
MongoClient.connect(url1, function(err, db) {
  if (err) throw err;
  var dbo = db.db("disaster_relief");
  var myquery = req.body[0];
  var newvalues = { $set: req.body[1] };
  dbo.collection("mail").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });
});
});





app.get("/boostable.js" , isLoggedIn , function(req , res){                   //Required for editable table - 2
res.sendFile('D:\\Courses\\Web dev\\DR\\views\\boostable.js');
});
app.get("/adminView" , isLoggedIn , function(req , res){    //Extra part rn incoming

   url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("disaster_relief");
  dbo.collection("mail").find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
   res.render("editableTable" , {username : username , obj1:result}) ;
    console.log('INSIDE APP.JS');
  });
});


});

app.post("/toggleclothes", function(req, res){
  var doc = req.body;
  console.log(doc)
  db.collection("clothes").updateOne(doc , {$set : {"received" : false}} , function(err , res){
    if(err)
        throw err  ;
      console.log('one updatewd get rekt')
  });

}) ;
app.post("/togglefood", function(req, res){
  var doc = req.body;
  console.log(doc)
  db.collection("food").updateOne(doc , {$set : {"received" : false}} , function(err , res){
    if(err)
        throw err  ;
      console.log('one updatewd get rekt')
  });

}) ;
app.post("/togglemedicine", function(req, res){
  var doc = req.body;
  console.log(doc)
  db.collection("meds").updateOne(doc , {$set : {"received" : false}} , function(err , res){
    if(err)
        throw err  ;
      console.log('one updatewd get rekt')
  });

}) ;


app.get("/ClothesSummary" , isLoggedIn , function(req , res){
    headings = {}
    console.log('INSIDE clothes summary')
    db.collection("clothes").find({received:true}).toArray(function(err , result){
        console.log(result) ;
         res.render("ClothesSummary" , {username : username ,obj1 : result })
    });

});
app.get("/MedicineSummary" , isLoggedIn , function(req , res){
    headings = {}
    console.log('INSIDE meds summary')
    db.collection("meds").find({received:true}).toArray(function(err , result){
        console.log(result) ;
         res.render("MedicineSummary" , {username : username ,obj1 : result })
    });

});
app.get("/FoodSummary" , isLoggedIn , function(req , res){
    headings = {}
    console.log('INSIDE food summary')
    db.collection("food").find({received:true}).toArray(function(err , result){
        console.log(result) ;
         res.render("FoodSummary" , {username : username ,obj1 : result })
    });

});

app.post("/userinfo", isLoggedIn, function(req,res){
  var input = req.body;
  var name = input.name;
  console.log(input);
  console.log('INSIDE user details')
  db.collection("users").find({username: name}).toArray(function(err , result){
      console.log(result) ;
       res.render("userdetails" , {obj : result })
  });
});

app.get("/userdetails", isLoggedIn, function(req,res){
  res.render("userdetails" , {obj : ''});
});
app.get("/adminhome", isLoggedIn, function(req,res){
  res.render("adminhome");
});

app.listen(3000,function(){
  console.log("Server running on port 3000...");
});

var express = require('express');
var router = express.Router();
var userModel= require("./users");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var multer=require("multer");
var Path=require("node:path");
var postModel=require("./post");
/* GET home page. */  
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/')
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    var date= new Date();
    const fileName=Math.floor(Math.random()*1000+date.getTime()) + Path.extname(file.originalname);
    cb(null, fileName)
  }
})
const upload = multer({ storage: storage,fileFilter : fileFilter})
router.post('/upload',isloggedIn,upload.single("avtar") ,function(req,res){
  userModel.findOne({username:req.session.passport.user}).then(function(user){
    console.log(req.file);
    user.image=req.file.filename;
    user.save().then(function(){
      res.redirect("back");
    })
  })
})
function fileFilter (req, file, cb) {
  console.log(file);
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg' || file.mimetype === 'image/webp')
  {
    cb(null, true)
  }
  else 
  {
    cb(new Error('upload right format!! don"t walk fast'),false);
  }
}


passport.use( new LocalStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/finduser/:user',isloggedIn,function(req, res) {
  const regex=new RegExp("^"+ req.params.user) 
  userModel.find({username:regex}).then(function(Allusers){
    res.json(Allusers);
  })
})
router.get('/username/:user', function(req, res, next) {
  userModel.findOne({username:req.params.user})
  .then((data)=>{
    if(data)
    {
    res.json({found: true});
    }
    else 
    {
      res.json({found: false});
    }
  })
});

router.get('/profile',isloggedIn, function(req, res) {
  userModel.findOne({username:req.session.passport.user}).then(function(user){
    res.render('profile',{founduser:user}); 
  })
});

router.post('/post',isloggedIn, function(req, res) {
  userModel.findOne({username:req.session.passport.user}).then(function(user){
    postModel.create({
      postdel:req.body.postdel,
    }).then(function(post){
      user.post_id.push(post._id);
      user.save().then(function()
      {  
        res.redirect("back");
      }
      )
    })
  })
});


router.get('/feed',isloggedIn, function(req, res) {
  userModel.find().populate({
    path:"post_id",
    populate:{
      path:'user_id'
    }
  }).then(function(founduser){
    res.render('feed',{founduser})
  })
})
//   userModel.find()
//   .populate('post_id')
//   .then((allusers)=>
//   {
//     res.render('feed',{founduser : allusers})
//   })
// });
router.get('/profile/:_id',isloggedIn, function(req, res) {
  userModel.findOne({_id:req.params._id}).then(function(user){
   var isloggedin= function (){
    if(req.session.passport.user.username===user.username)
    return true;
    else
    return false;
    }
     res.render('profile',{founduser:user,isloggedin}); 
  })
});
router.get('/like/:id', function(req, res, next) {
  userModel.findOne({_id:req.params.id}).then(function(u){
    var jisheMillaha=u.likes.indexOf(req.session.passport.user)
    if(jisheMillaha===-1){
      u.likes.push(req.session.passport.user);
    }
    else
   { 
    u.likes.splice(jisheMillaha,1);
   }
    u.save().then(function(){
    res.redirect("back");
    })
  })
});
router.post('/register', function(req, res) {
  var newUser= new userModel ({
    username:req.body.username,
    email:req.body.email,
    number:req.body.number,
    image:req.body.image 
  })
  userModel.register(newUser,req.body.password).then(function(u){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  });
});
router.post('/login', passport.authenticate('local',
   { successRedirect:'/profile',
     failureRedirect:'/'
}), function(req, res, next) {});
router.get('/logout',function(req,res,nex){
  req.logOut(function(err){
    if(err){
      return next(err);
    }
    res.redirect('/');
  })
})
function isloggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/');
  }
}

module.exports = router;

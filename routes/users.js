var mongoose = require("mongoose");
var passportLocalMongoose= require("passport-local-mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/userdata');
var userSchema= mongoose.Schema({
  image:{
    type:String,
    default:"default.jpg"
  },
  username:String,
  email:String,
  password:String,
  number:Number,
  likes:{
    type:Array,
    default:[]
  },
  post_id:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"post"
    }
  ]
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user",userSchema);
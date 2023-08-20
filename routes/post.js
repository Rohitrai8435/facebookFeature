var mongoose = require("mongoose");
var userSchema= mongoose.Schema({
  user_id:[
         {   type:mongoose.Schema.Types.ObjectId,
             ref:"user"
           }
      ],
  postdel:String, 
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    default:[]
  }]
});
module.exports = mongoose.model("post",userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true},
    age:{type:Number},
    role:{
        type:String,
        enum:["admin","instructor","student"]
    }
});


const User = mongoose.model("user",userSchema);

module.exports = User;
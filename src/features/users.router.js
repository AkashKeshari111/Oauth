const express = require("express");
const User = require("./users.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const app=express.Router();

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'pauline.kertzmann@ethereal.email',
        pass: 'zjC1MqWzj7BbgcNcjc'
    }
});

app.post("/signup",async(req,res)=>{
    const {email,password,age} = req.body;
    try{
       let user = await User.findOne({email})
       if(user){
        return res.status(403).send("User Already Exists")
       }
       let newUser = await User.create({email,password,age,role:"instructor"});
       newUser.save();
       let token = jwt.sign({id:newUser._id,email:newUser.email,password:newUser.password},"SECRET321",{expiresIn:"5minute"});
       transporter.sendMail({
        to: newUser.email, // list of receivers
        from: 'shabaz@gmail.com', // sender address
        subject: "Hello ✔", // Subject line
        text: `Hi, ${newUser.email} Account Created Successfully`, // plain text body
      }).then(()=>{
        console.log("Email Sent Successfully")
            return res.send({message:"Account Created Successfully",token});
      });
    }catch(err){
        res.status(500).send(err.message)
    }
});

app.post("/login",async(req,res)=>{
    let {email,password} = req.body;
    try{
      let user = await User.findOne({email,password});
      if(!user){
        return res.status(401).send("User Not Authorized");
      }
      let token = jwt.sign({role:user.role,id:user._id,email:user.email,password:user.password},"SECRET321",{expiresIn:"20minutes"});
      let refreshToken = jwt.sign({role:user.role,id:user._id,email:user.email,password:user.password},"REFRESHSECRET321",{expiresIn:"7days"});
      if(user.role==="student"){
       return res.send({role:"You are Student",token,refreshToken})
    }else if(user.role==="instructor"){
        return res.send({role:"You are Instructor",token,refreshToken})
     }else if(user.role==="admin"){
        return res.send({role:"You are Admin",token,refreshToken})
     }
     // return res.send({message:"login Successfully",token,refreshToken});
     
    }catch(err){
        res.status(500).send(err.message)
    }
});

app.get("/user/:id",async(req,res)=>{
    let {id} = req.params;
    let token = req.headers.authorization;
    if(!token){
        return res.status(401).send("Not Authorized")
    }
    try{
    //    let verification = jwt.verify(token,"SECRET321");
    //    console.log(verification);
       let userData = await User.findById(id);
       return res.send(userData)
    }catch(err){
        console.log(err.message);
        return res.send(498).send("Invalid Token")
    }
});

app.post("/refresh",(req,res)=>{
    let refreshToken = req.headers.authorization;
    try{
     let data = jwt.verify(refreshToken,"REFRESHSECRET321")
     let mainToken = jwt.sign(data,"SECRET321");
     return res.send({token:mainToken});
    }catch(err){
        res.status(500).send(err.message)
    }
});

app.get("/github/callback",(req,res)=>{
    console.log(req.query.code);
    res.send("Signup Successfully")
});

app.get("/",(req,res)=>{
    res.send("<a href='https://github.com/login/oauth/authorize?client_id=5b832a5a08f0ec90d6e7' >Sign Up With GitHub</a>")
})

const otps={};

app.post("/forget",(req,res)=>{
    let {email} = req.body;
    const otp = Math.floor(Math.random()*1000000);
    otps.email = otp;
    transporter.sendMail({
        to: email, // list of receivers
        from: 'shabaz@gmail.com', // sender address
        subject: "OTP", // Subject line
        text: `Hi, ${email},Your OTP is${otp}`, // plain text body
      }).then(()=>{
        console.log("Email Sent Successfully")
            return res.send("Email Sent Successfully");
      });
       
});

app.post("/reset",(req,res)=>{
    const {email,newPassword,otp} = req.body;
    console.log(email,otp);
    if(otps.email===otp){
        return res.send("newPassword Update Successfully")
    }
    res.send("Invalid OTP")
});

app.post("/createlecture",(req,res)=>{
    const token = req.headers.authorization;
    const verifyData = jwt.verify(token,"SECRET321");

    const accessData = require("../access.json");
   const role = accessData.find((e=>e.role===verifyData.role));
   
    if(role.access.lecture.includes("CRU")){
        return res.send("Lecture Created Successfully")
    }else{
        res.send("Not Allowed")
    }
})



module.exports = app;
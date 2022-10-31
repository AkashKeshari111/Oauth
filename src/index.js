const express = require("express");
const connect = require("./config/db")
const userRouter = require("./features/users.router");

const app = express();

app.use(express.json());
app.use("/",userRouter)

// app.get("/",(req,res)=>{
//     res.send("Home")
// })


app.listen(8080,async()=>{
       await connect();
        console.log("Server Started on http://localhost:8080")
    })


// mongoose.connect("mongodb://localhost:27017/nem222").then(()=>{
//     app.listen(8000,()=>{
//         console.log("Server Started on http://localhost:8000")
//     })
// })
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");


let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

// // const dotenv = require('dotenv');
// const express=require("express");
// const app=express();

// const userRoute=require("./routes/v1/user.route");
// const PORT=process.env.PORT;
// const DB_URI=process.env.MONGODB_URL;


// mongoose
//     .connect(`${DB_URI}`,{ useNewUrlParser: true ,useUnifiedTopology: true })
//     .then(()=> console.log("Connected to DB at: ",DB_URI))
//     .catch((e)=>console.log("Failed to connect to DB",e));

 

// app.use("/v1/users",userRoute);

// app.listen(PORT,()=>{
//     console.log("Express Server running at",PORT);
// })    



mongoose.connect(config.mongoose.url,config.mongoose.options).then(()=>{
        console.log("Connected to MongoDB");
        server=app.listen(config.port,()=>{
            console.log(`Listening to port ${config.port}`);
        });
    });
    

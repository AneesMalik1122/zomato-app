
const mongoose=require("mongoose");


function connectDB(){

    mongoose.connect(process.env.MONGO_URI)

    .then(()=>{
        console.log("DB are connect")
    })
    .catch((err)=>{
        console.log("DB are not connect")

    })
}

module.exports=connectDB;
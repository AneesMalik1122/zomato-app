
const mongoose=require("mongoose")


const foodpartnerSchema= new mongoose.Schema({
    bussinessName:{
        type:String,
        required:true
    },
    contactName:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true

    }

})

const foodPartnerModel=mongoose.model("foodpartner",foodpartnerSchema);

module.exports=foodPartnerModel;

const foodModel=require("../model/fooditem.model");
const foodPartnerModel=require("../model/foodpartner.model");
const mongoose=require("mongoose");

function toPublicFoodPartner(foodPartner){
    const partner=foodPartner.toObject()
    delete partner.password
    return {
        ...partner,
        name:partner.bussinessName,
        businessName:partner.bussinessName
    }
}

async function getFoodPartnerProfile(req,res){
    const foodPartner=req.foodPartner;

    if(!foodPartner){
        return res.status(404).json({message:"Food Partner not found"});
    }

    const foods=await foodModel.find({
        $or:[
            {foodPartner:foodPartner._id},
            {foodPartnerId:foodPartner._id}
        ]
    })
        .select("name description video")
        .lean();
    res.status(200).json({
        message:"Food Partner found",
        foodPartner:{
            ...toPublicFoodPartner(foodPartner),
            totalMeals:foods.length
        },
        foods
    });
}

async function getFoodPartnerById(req,res){
    const {id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message:"A valid food partner ID is required."})
    }

    const foodPartner=await foodPartnerModel.findById(id)
    if(!foodPartner){
        return res.status(404).json({message:"Food partner not found."})
    }

    const foods=await foodModel.find({
        $or:[
            {foodPartner:foodPartner._id},
            {foodPartnerId:foodPartner._id}
        ]
    })
        .select("name description video foodPartner foodPartnerId likeCount saveCount")
        .sort({createdAt:-1})
        .lean()

    return res.status(200).json({
        message:"Food partner store found.",
        foodPartner:{
            ...toPublicFoodPartner(foodPartner),
            totalMeals:foods.length
        },
        foods
    })

}

module.exports={
    getFoodPartnerProfile,
    getFoodPartnerById
}
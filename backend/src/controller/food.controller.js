const foodModel=require("../model/fooditem.model");
const likeModel=require("../model/likes.model");
const savedModel=require("../model/saved.model");
const mongoose=require("mongoose");

const storageService=require("../services/storage.service");
const {v4:uuid}=require("uuid")



async function createFoodPartner(req,res) {

const FileUploadResult=await storageService.uploadFile(req.file.buffer,uuid())

const fooditem = await foodModel.create({
    name:req.body.name,
    description:req.body.description,
    video:FileUploadResult.url,
    foodPartner:req.foodPartner._id
})

res.status(201).json({
    message:"food create successfully",
    food:fooditem
})
    
    
}

async function getFoodItems(req,res) {

    const foodItems=await foodModel.find({}).lean()
    const foodIds=foodItems.map((food)=>food._id)
    const [likes,saves]=req.user
        ? await Promise.all([
            likeModel.find({user:req.user._id,food:{$in:foodIds}}).select("food").lean(),
            savedModel.find({user:req.user._id,food:{$in:foodIds}}).select("food").lean()
        ])
        : [[],[]]
    const likedFoodIds=new Set(likes.map((like)=>String(like.food)))
    const savedFoodIds=new Set(saves.map((save)=>String(save.food)))

    res.status(200).json({
        message:"Food item fectched successfully",
        foodItems:foodItems.map((food)=>({
            ...food,
            likedByUser:likedFoodIds.has(String(food._id)),
            savedByUser:savedFoodIds.has(String(food._id))
        }))
    })
    
}

async function toggleFoodReaction(req,res,model,countField,statusField,labels) {
    const foodId=req.body?.foodid
    if(!mongoose.Types.ObjectId.isValid(foodId)){
        return res.status(400).json({message:"A valid foodid is required."})
    }

    const food=await foodModel.findById(foodId).select("_id")
    if(!food){
        return res.status(404).json({message:"Food item not found."})
    }

    const filter={user:req.user._id,food:foodId}
    const existing=await model.findOne(filter)
    let isActive

    if(existing){
        await model.deleteOne({_id:existing._id})
        await foodModel.updateOne(
            {_id:foodId,[countField]:{$gt:0}},
            {$inc:{[countField]:-1}}
        )
        isActive=false
    }else{
        await model.create(filter)
        await foodModel.updateOne({_id:foodId},{$inc:{[countField]:1}})
        isActive=true
    }

    const updatedFood=await foodModel.findById(foodId).select(countField).lean()
    return res.status(200).json({
        message:isActive?labels.active:labels.inactive,
        [statusField]:isActive,
        [countField]:Math.max(0,updatedFood?.[countField] ?? 0)
    })
}

async function likesFoodItem(req,res) {
    return toggleFoodReaction(
        req,
        res,
        likeModel,
        "likeCount",
        "liked",
        {active:"Food item liked successfully",inactive:"Food item unliked successfully"}
    )
}

async function savedFood(req,res){
    return toggleFoodReaction(
        req,
        res,
        savedModel,
        "saveCount",
        "saved",
        {active:"Food item saved successfully",inactive:"Food item unsaved successfully"}
    )
}

async function getSavedFoodItems(req,res) {
    const savedItems=await savedModel.find({user:req.user._id})
        .populate("food")
        .sort({createdAt:-1})
        .lean()
    const foodItems=savedItems
        .filter((item)=>item.food)
        .map((item)=>({...item.food,savedByUser:true}))

    return res.status(200).json({
        message:"Saved food items fetched successfully",
        foodItems
    })
}


module.exports = {
    createFoodPartner,
    getFoodItems,
    getSavedFoodItems,
    likesFoodItem,
    savedFood
};
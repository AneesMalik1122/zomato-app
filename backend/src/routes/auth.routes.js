
const express=require("express");
const authController=require("../controller/auth.controller");


const router=express();

//   user auth routes
router.post("/user/register",authController.userRegisterController)
router.post("/user/login",authController.userloginController)
router.get("/user/logout",authController.userLogout)

// foodpartner auth routes

router.post("/food-partner/register",authController.foodpartnerRegister)
router.post("/food-partner/login",authController.foodPartnerlogin)


module.exports=router


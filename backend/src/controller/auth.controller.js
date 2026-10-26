
const userModel=require("../model/user.model");
const foodPartnerModel=require("../model/foodpartner.model")
const jwt=require("jsonwebtoken")

const bcrypt=require("bcryptjs")

async function userRegisterController(req,res) {

    const {fullname,email,password,phone}=req.body;

    const isUserExisted= await userModel.findOne({
        email:email
    })
    if(isUserExisted){
        return res.status(409).json({
            message:"email already Existed"
        })
    }

    const hash= await bcrypt.hash(password,10)

    const user=await userModel.create({
        fullname: fullname,
        email,
        password:hash,
        phone,
    })
     

    const token=jwt.sign({
        id:user._id,
    },process.env.JWT_SECRECT)

    res.cookie("token",token)

    res.status(200).json({
        message:"user already Register successfully",
        user:{
            _id:user._id,
            email:user.email,
            fullname:user.fullname
        },
        token
    })
    
}

async function userloginController(req,res) {

    const {email,password}=req.body;
    
    const user=await userModel.findOne({
        email
    })

    if(!user){
        return res.status(400).json({
            message:" Invalid email or password"
        })

    }

    const isPasswordValid= await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(401).json({
            message:"invalid  password"
        })
    }

    const token=jwt.sign({
        id:user._id
    },process.env.JWT_SECRECT)

    res.cookie("token",token)

    res.status(200).json({
        message:"user login successfully",
        user:{
            _id:user._id,
            email:user.email,
            Fullname:user.Fullname
        },
        token,
    })
    
}

function userLogout(req,res){
    res.clearCookie("token");
        res.status(200).json({
            message:"user logOut successsfully"
        });
    
}

async function foodpartnerRegister(req,res) {

    const {bussinessName,email,password,phone,address,contactName}=req.body;

    const isAlreadyExisted=await foodPartnerModel.findOne({
        email:email
    }) 

    if(isAlreadyExisted){
        return res.status(409).json({
            message:"email already Existed "
        })
    }

    const hash=await bcrypt.hash(password,10)

    const foodPartner= await foodPartnerModel.create({
        bussinessName,
        email,
        password:hash,
        phone,
        address,
        contactName

    })

    const token=jwt.sign({
        id:foodPartner._id,
    },process.env.JWT_SECRECT)

    res.cookie("token",token)


    res.status(201).json({
        message:"FoodPartner registered successfully",
        foodPartner:{
            _id:foodPartner._id,
            email:foodPartner.email,
            name:foodPartner.name
        },
        token
    })
    
}

async function foodPartnerlogin(req,res) {

    const {email,password}=req.body;

    const foodPartner=await foodPartnerModel.findOne({
        email
    })

    if(!foodPartner){
        return res.status(409).json({
            message:"email invalid"
        })
    }

    const hashedPassword= await bcrypt.compare(password,foodPartner.password)

    if(!hashedPassword){
        return res.status(409).json({
            message:"password Invalid"
        })
    }


     const token=jwt.sign({
        id:foodPartner._id,
     },process.env.JWT_SECRECT)

     res.cookie("token",token)

     res.status(201).json({
        message:"foodPartner login successfully",
        foodPartner:{
            _id:foodPartner._id,
            email:foodPartner.email,
            name:foodPartner.name
        },
        token
     })

    
}

module.exports={userRegisterController,userloginController,userLogout,foodpartnerRegister,foodPartnerlogin}

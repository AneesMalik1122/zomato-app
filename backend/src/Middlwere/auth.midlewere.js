
const foodPartnerModel=require("../model/foodpartner.model");
const userModel=require("../model/user.model")
const jwt=require("jsonwebtoken");

function getToken(req) {
    const authorization = req.get("authorization");
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    return bearerToken || req.cookies?.token;
}

async function authFoodPartnerMiddlewere(req,res,next) {

    const token = getToken(req);

    if(!token){
        return res.status(401).json({
            message:"Authentication required. Please log in as a food partner."
        })
    }

    let decoded;
    try{
        decoded=jwt.verify(token,process.env.JWT_SECRECT)
    }catch(error){
        return res.status(401).json({message:"invalid food partner token"});
    }

    try{
        const foodPartner=await foodPartnerModel.findById(decoded.id);
        if(!foodPartner){
            return res.status(401).json({
                message:"invalid food partner token"
            })
        }

        req.foodPartner=foodPartner
        return next();
    }catch(error){
        console.error("Food partner authentication failed:",error);
        return res.status(500).json({message:"Could not authenticate food partner"});
    }
    
}

async function authUserMiddleware(req,res,next) {

    const token = getToken(req);

    if(!token){
        return res.status(401).json({
            message:"Authentication required. Please log in as a user."
        })
    }

    let decoded;
    try{
        decoded=jwt.verify(token,process.env.JWT_SECRECT)
    }catch(err){
       return res.status(401).json({
            message:"Invalid or expired authentication token."
        })
    }

    try {
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message:"Invalid or expired authentication token."
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error("User authentication failed:", error);
        return res.status(500).json({
            message:"Could not authenticate user."
        });
    }
    
}

async function optionalAuthUserMiddleware(req,res,next) {
    const token=getToken(req)
    if(!token) return next()

    let decoded
    try {
        decoded=jwt.verify(token,process.env.JWT_SECRECT)
    } catch {
        return next()
    }

    try {
        req.user=await userModel.findById(decoded.id)
        return next()
    } catch(error) {
        console.error("Optional user authentication failed:",error)
        return res.status(500).json({
            message:"Could not verify the optional user session."
        })
    }
}

module.exports={authFoodPartnerMiddlewere,authUserMiddleware,optionalAuthUserMiddleware}
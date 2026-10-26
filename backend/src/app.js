require("dotenv").config();
const express=require("express");
const authRoutes=require("../src/routes/auth.routes");
const foodRoutes=require("../src/routes/Food.route");
const foodPartnerRoutes=require("../src/routes/food-partner.routes");
const cookieparser=require("cookie-parser");
const cors=require("cors");




const app=express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true                
}));

app.use(cookieparser());
app.use(express.json());


app.use("/api/auth",authRoutes)
app.use("/api/food",foodRoutes)
app.use("/api/food-partner",foodPartnerRoutes)


module.exports=app;
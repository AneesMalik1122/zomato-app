
const express = require("express");
const foodController = require("../controller/food.controller");
const authmiddlewere = require("../Middlwere/auth.midlewere");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
});

const router = express.Router();

router.post("/", authmiddlewere.authFoodPartnerMiddlewere, upload.single("video"), foodController.createFoodPartner);
router.get("/", authmiddlewere.optionalAuthUserMiddleware, foodController.getFoodItems);
router.get("/saved", authmiddlewere.authUserMiddleware, foodController.getSavedFoodItems);
router.post("/like", authmiddlewere.authUserMiddleware, foodController.likesFoodItem);
router.post("/save", authmiddlewere.authUserMiddleware, foodController.savedFood);
module.exports = router;
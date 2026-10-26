
const express = require('express');
const router = express.Router();
const foodPartnerController = require('../controller/food-partner.controller');
const authMiddleware = require('../Middlwere/auth.midlewere');

router.get("/profile",
    authMiddleware.authFoodPartnerMiddlewere,
    foodPartnerController.getFoodPartnerProfile
);

router.get("/:id", foodPartnerController.getFoodPartnerById);


module.exports = router;
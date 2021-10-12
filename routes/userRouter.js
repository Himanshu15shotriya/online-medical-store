const express = require('express');
const passport = require('passport');
const router = express.Router();

// Middlewares
const validation = require("../middleware/validation")
const authentication = require("../middleware/authentication")

//controller
const ctrUser = require('../src/controllers/userController')

router.post("/signup" ,validation, ctrUser.userSignup)

router.post("/signin" ,validation, ctrUser.userSignin)

router.get("/profile" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userProfile)

router.get("/all-medicines" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userAllMedicines)

router.post("/add-to-cart/:id" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userAddToCart)

router.get("/remove-from-cart/:id" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userRemoveFromCart)

router.get("/my-cart" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userMyCart)

router.get("/signout" ,passport.authenticate("jwt-2",{session:false}),authentication, ctrUser.userSignout)




module.exports = router;

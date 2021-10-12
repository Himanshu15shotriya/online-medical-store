const express = require('express');
const passport = require('passport');
const router = express.Router();
const validation = require("../middleware/validation")
const authentication = require("../middleware/authentication")
// const decode = require("../middleware/decode")

ctrAdmin = require('../src/controllers/adminController')

router.post("/signup" ,validation, ctrAdmin.adminSignup)

router.post("/signin" ,validation, ctrAdmin.adminSignin)

router.get("/profile" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminProfile)

router.get("/profile-delete" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminProfileDelete)

router.post("/change-password" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminChangePassword)

router.post("/add-medicine" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminAddMedicine)

router.post("/update-medicine/:id" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminUpdateMedicine)

router.get("/all-medicines" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminAllMedicines)

router.post("/med-by-name" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminMedByName)

router.post("/med-by-company" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminMedByCompany)

router.get("/delete-medicine/:id" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminDeleteMedicine)

router.get("/signout" ,passport.authenticate("jwt",{session:false}),authentication, ctrAdmin.adminSignout)




module.exports = router;
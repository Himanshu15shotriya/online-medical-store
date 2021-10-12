const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admins')
const Medicine = require('../models/Medicines')


// @type     POST
// @route    /admin/signup
// @desc     route for signup of admins.
// @access   PUBLIC 
module.exports.adminSignup = async(req,res)=> {
    const admin = await Admin.findOne({email:req.body.email});
    if(admin){
        res.status(200).send({
            success: false,
            message: "This email is already exist"
        })
    }else{
        if(req.body.password === req.body.confirmpassword){
            bcrypt.genSalt(10,(err,salt) => {
                bcrypt.hash(req.body.password,salt,(err,hash) => {
                    if (err) throw err;
                    const newAdmin = new Admin({
                        ...req.body
                    })
                    newAdmin.password = hash
                    newAdmin
                    .save()
                    .then(admin => {
                        if(admin){
                            const payload = {
                                id : admin.id
                            }
                            jwt.sign(
                                payload,
                                process.env.SECRET,
                                {expiresIn : "9h"},
                                async(err,token) => {
                                    if(err ) {
                                        res.status(200).send({
                                            success : false,
                                            message : err.message,
                                        })
                                    }else{
                                        const admin = await Admin.findOneAndUpdate(
                                            {email : req.body.email},
                                            {token : "Bearer " + token},
                                            {new : true}
                                            )
                                        if(admin){
                                            res.status(200).send({
                                                success: true,
                                                message : "Signup successfully",
                                                data : admin
                                            })
                                        }else{
                                            res.status(200).send({
                                                success: false,
                                                message : err.message
                                            })
                                        }
                                    }
                                }
                            )
                        }else{
                            res.status(200).send({
                                success: false,
                                message : "Error in signup"
                            })
                        }
                    })
                    .catch(err => res.status(500).send({
                        success: false,
                        message : err.message
                    }))
                })
            })
        }else{
            res.status(200).send({
                success: false,
                message: "Password and confirm password are not matched"
            })
        }
    }
}


// @type     POST
// @route    /admin/signin
// @desc     route for signin of admins.
// @access   PUBLIC 
module.exports.adminSignin = async(req,res) => {
    try {
        const admin  = await Admin.findOne({email : req.body.email});
        if(admin){
            const comparePassword = await bcrypt.compare(req.body.password, admin.password)
            if(comparePassword){
                const payload = {
                    id : admin.id,
                    email : admin.email
                }
                jwt.sign(
                    payload,
                    process.env.SECRET,
                    {expiresIn : "9h"},
                    async(err,token) => {
                        if(err){ 
                            res.status(200).send({
                                success: false,
                                message: err.message
                            })
                        }else{
                            const admin = await Admin.findOneAndUpdate(
                                {email : req.body.email},
                                {token :"Bearer " + token},
                                {new: true}
                            )
                            if(admin){
                                res.status(200).send({
                                    success: true,
                                    message : "Signin successfully",
                                    token : "Bearer " + token
                                })
                            }else{
                                res.status(200).send({
                                    success: false,
                                    message: "Error in sign in"
                                })
                            }
                        }
                    }
                )
            }
            else{
                res.status(200).send({
                    success: false,
                    message : "Please enter correct password",
                })
            }
        }
        else{
            res.status(200).send({
                success: false,
                message : "Signup First",
            })
        }
    }catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     GET
// @route    /admin/profile
// @desc     route for showing profile of admins.
// @access   PUBLIC 
module.exports.adminProfile = async(req,res)=> {
    try{
        const admin = await Admin.findOne({_id : req.user.id}).select({token:0,__v:0})
        if(admin){
            res.status(200).send({
                success: true,
                data : admin
            })
        }else{
            res.status(200).send({
                success: false,
                message : "Admin not found",
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/profile-delete
// @desc     route for deleting account of admins.
// @access   PUBLIC 
module.exports.adminProfileDelete = async(req,res) => {
    try{
        const comparePassword = await bcrypt.compare(req.body.password , req.user.password)
        if(comparePassword){
            const admin = await Admin.findOneAndRemove({_id : req.user.id})
            if(admin){            
                res.status(200).send({
                    success: true,
                    message : `The admin account registered with ${req.user.email} has been deleted successfully`,
                })            
            }else{
                res.status(200).send({
                    success: false,
                    message : "Admin not found",
                })
            }
        }else{
            res.status(200).send({
                success: false,
                message : "Please enter correct password",
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/change-password
// @desc     route for changing password of admin account.
// @access   PUBLIC 
module.exports.adminChangePassword = async(req,res)=> {
    try{
        const comparePassword = await bcrypt.compare(req.body.currentpassword ,req.user.password);
        if(comparePassword){
            if(req.body.newpassword === req.body.confirmpassword){
                bcrypt.genSalt(10,(err,salt) => {
                    bcrypt.hash(req.body.newpassword,salt,async(err,hash) => {
                        if (err) throw err;
                        newpassword = hash;
                        const admin = await Admin.findOneAndUpdate(
                            {_id : req.user.id},
                            {password : newpassword},
                            {new : true}
                        )
                        if(admin){
                            res.status(200).send({
                                success: true,
                                message : "Password changed successfully",
                            })
                        }else{
                            res.status(200).send({
                                success: false,
                                message : "Admin not found",
                            })
                        }
                    })
                })
            }else{
                res.status(200).send({
                    success: false,
                    message : "New password and confirm password are not matched",
                })
            }
        }else{
            res.status(200).send({
                success: false,
                message : "Current password is wrong. Please enter correct password",
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/add-medicine
// @desc     route for adding medicins..
// @access   PUBLIC
module.exports.adminAddMedicine = async (req,res) => {
    try{
        const medicine = await Medicine.findOne({name : req.body.name});
        if(medicine){
            res.status(200).send({
                success: false,
                message : "This medicine is already added",
            })
        }
        else{
            const newMedicine = new Medicine({
                ...req.body,
                admin : req.user.id
            })
            newMedicine
            .save()
            .then(
                res.status(200).send({
                    success: true,
                    message : `${req.body.name} has been added successfully`,
                    data : newMedicine
                })
            )
            .catch(err => {
                res.status(500).send({
                    success: false,
                    message : err.message,
                })
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     post
// @route    /admin/update-medicine/:id
// @desc     route for update quantity of medicine.
// @access   PRIVATE
module.exports.adminUpdateMedicine = async(req, res) => {
    try {
        if(req.body.quantity && !req.body.price){
            const medicine = await Medicine.findOneAndUpdate(
                {_id : req.params.id},
                {quantity : req.body.quantity},
                {new : true}
            )
            if(medicine){
                res.status(200).json({
                    success: true,
                    Message: "Quantity updated successfully"
                })
            }
            else{
                res.status(200).json({
                    success: false,
                    Message: "Error in updating quantity"
                })
            }
        }
        else if(req.body.price && !req.body.quantity){
            const medicine = await Medicine.findOneAndUpdate(
                {_id : req.params.id},
                {price : req.body.price},
                {new : true}
            )
            if(medicine){
                const medicine1 = await Mycart.find({name : medicine.name})
                if(medicine1){
                    for(let i=0; i<medicine1.length;i++){
                        var medicine2 = await Mycart.findOneAndUpdate(
                            {_id : medicine1[i]._id},
                            {price : req.body.price*medicine1[i].quantity},
                            {new : true}
                        )
                    }
                    if(medicine2){
                        res.status(200).json({
                            success: true,
                            Message: "You have successfully updated price of medicine"
                        })
                    }
                    else{
                        res.status(200).json({
                            success: false,
                            Message: "Error in updating price in user's cart"
                        })
                    }
                }
                else{
                    res.status(200).json({
                        success: false,
                        Message: "No medicine found"
                    })
                }
            }
            else{
                res.status(200).json({
                    success: false,
                    Message: "Error in updating price"
                })
            }
        }
        else if(req.body.quantity && req.body.price){
            const changequantity = {}
            if(req.body.quantity) changequantity.quantity = req.body.quantity
            if(req.body.price) changequantity.price = req.body.price
            const medicine = await Medicine.findOneAndUpdate(
                {_id:req.params.id},
                {$set:changequantity},
                {new:true})
            if(medicine){
                const medicine1 = await Mycart.find({name : medicine.name})
                if(medicine1){
                    for(let i=0; i<medicine1.length;i++){
                        var medicine2 = await Mycart.findOneAndUpdate(
                            {_id : medicine1[i]._id},
                            {price : req.body.price*medicine1[i].quantity},
                            {new : true}
                        )
                    }
                    if(medicine2){
                        res.status(200).json({
                            success: true,
                            Message: `You Have Successfully Updated The Medicine.`
                        })
                    }
                    else{
                        res.status(200).json({
                            success: false,
                            Message: "Error in updating price in user's cart"
                        })
                    }
                }
                else{
                    res.status(200).json({
                        success: false,
                        Message: "No medicine found"
                    })
                }
            }else{
                res.status(200).json({
                    success: false,
                    Message: "Error in updation"
                })
            }
        }
        else{
            res.status(200).json({
                success: true,
                Message: "No updation found"
            })
        }
        
    } catch (error) {
        res.status(500).send({success: false, message: error.message})
    }
}


// @type     POST
// @route    /admin/all- medicine
// @desc     route for showing all medicines.
// @access   PUBLIC 
module.exports.adminAllMedicines = async (req,res) => {
    try{
        const medicine = await Medicine.find({admin : req.user.id})
        if(medicine){
            res.status(200).send({
                success: true,
                message: medicine
            })
        }
        else{
            res.status(200).send({
                success: false,
                message: "No medicines found"
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/delete- medicine/:id
// @desc     route for deleting medicine.
// @access   PUBLIC 
module.exports.adminDeleteMedicine = async (req,res) => {
    try{
        const medicine = await Medicine.findOneAndRemove({_id: req.params.id , admin : req.user.id});
        if(medicine){
            res.status(200).send({
                success: true,
                message: `${medicine.name} has been deleted successfully`
            })
        }
        else{
            res.status(200).send({
                success: false,
                message: `${medicine.name} not found`
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/med-by-name
// @desc     route for searching medicine by name.
// @access   PUBLIC 
module.exports.adminMedByName = async (req,res) => {
    try{
        const medicine = await Medicine.findOne({name : req.body.name})
        if(medicine){
            res.status(200).send({
                success: true,
                message: medicine
            })
        }
        else{
            res.status(200).send({
                success: false,
                message: `${medicine.name} not found`
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /admin/med-by-company
// @desc     route for searching medicine by company name.
// @access   PUBLIC 
module.exports.adminMedByCompany = async (req,res) => {
    try{
        const medicine = await Medicine.find({company : req.body.company})
        if(medicine){
            res.status(200).send({
                success: true,
                message: medicine
            })
        }
        else{
            res.status(200).send({
                success: false,
                message: `${medicine.name} not found`
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     GET
// @route    /admin/signout
// @desc     route for signout of admins.
// @access   PUBLIC
module.exports.adminSignout = async(req,res)=> {
    try{
        const admin = await Admin.findOneAndUpdate(
            {_id : req.user.id},
            {token: ""},
            {new : true}
        )
        if(admin){
            res.status(200).send({
                success: true,
                message : "Signout Successfully",
            })
        }else{
            res.status(200).send({
                success: false,
                message : "Admin not found",
            })
        }
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
} 

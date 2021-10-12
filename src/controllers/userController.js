const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//models
const User = require('../models/Users')
const Medicine = require('../models/Medicines')
const Mycart = require('../models/MyCart');
const MyCart = require('../models/MyCart');
const { response } = require('express');

// @type     POST
// @route    /user/signup
// @desc     route for signin of user.
// @access   PUBLIC 
module.exports.userSignup = async(req,res)=> {
    const user = await User.findOne({email:req.body.email});
    if(user){
        res.status(200).send({
            success: false,
            message: "This email is already exist"
        })
    }else{
        if(req.body.password === req.body.confirmpassword){
            bcrypt.genSalt(10,(err,salt) => {
                bcrypt.hash(req.body.password,salt,(err,hash) => {
                    if (err) throw err;
                    const newUser = new User({
                        ...req.body
                    })
                    newUser.password = hash
                    newUser
                    .save()
                    .then(user => {
                        if(user){
                            const payload = {
                                id : user.id
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
                                        const user = await User.findOneAndUpdate(
                                            {email : req.body.email},
                                            {token : "Bearer " + token},
                                            {new : true}
                                            )
                                        if(user){
                                            res.status(200).send({
                                                success: true,
                                                message : "Signup successfully",
                                                data : user
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
// @route    /user/signup
// @desc     route for signup of user.
// @access   PUBLIC 
module.exports.userSignin = async(req,res) => {
    try {
        const user  = await User.findOne({email : req.body.email});
        if(user){
            const comparePassword = await bcrypt.compare(req.body.password, user.password)
            if(comparePassword){
                const payload = {
                    id : user.id,
                    email : user.email
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
                            const user = await User.findOneAndUpdate(
                                {email : req.body.email},
                                {token :"Bearer " + token},
                                {new: true}
                            )
                            if(user){
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
// @route    /user/profile
// @desc     route for showing profile of users.
// @access   PUBLIC 
module.exports.userProfile = async(req,res)=> {
    try{
        const user = await User.findOne({_id : req.user.id}).select({token:0,__v:0})
        if(user){
            res.status(200).send({
                success: true,
                data : user
            })
        }else{
            res.status(200).send({
                success: false,
                message : "User not found",
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
// @route    /user/all-medicines
// @desc     route for showing all medicines to users.
// @access   PUBLIC 
module.exports.userAllMedicines = async (req,res) => {
    try{
        const medicine = await Medicine.find({admin : req.user.admin}).select({__v : 0 })
        if(medicine){
            var medicineQuantity = []
            for(var i=0;i<medicine.length;i++){
                if(medicine[i].quantity<11){
                    var quantity = [medicine[i],`Quantity ${medicine[i].quantity} left in stock`]
                }
                else{
                    var quantity= medicine[i]
                }
                medicineQuantity.push(quantity)
            }
            res.status(200).json({
                success : true,
                medicines : medicineQuantity})
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
// @route    /user/add-to-cart/:id
// @desc     route for adding medicines in user's cart.
// @access   PUBLIC 
module.exports.userAddToCart = async(req,res) => {
    try{
        const medicine = await Medicine.findOne({_id : req.params.id})
        if(medicine){
            const medicine2 = await MyCart.findOne({name : medicine.name,user : req.user.id})
            if(medicine2){
                if(medicine2.quantity>=6){
                    res.status(200).send({
                        success: false,
                        message: "You have already added maximum no. of quantity"
                    })
                }
                else{
                    var quantity = parseInt(req.body.quantity)
                    if((quantity+medicine2.quantity)>6){
                        res.status(200).send({
                            success: false,
                            message:`You cannot add ${req.body.quantity} quantities as you can add only ${6-medicine2.quantity} quantities`
                        })
                    }
                    else{
                        const medicine3 = await Mycart.findOneAndUpdate(
                            {name : medicine2.name},
                            {
                                quantity : quantity+medicine2.quantity,
                                price : medicine2.price+(medicine.price*quantity)
                            },
                            {new : true}
                        )
                        if(medicine3){
                            const medicine4 = await Medicine.findOneAndUpdate(
                                {name : medicine.name},
                                {quantity : medicine.quantity-quantity},
                                {new : true}
                            )
                            if(medicine4){
                                res.status(200).send({
                                    success: true,
                                    message: `${medicine.name} added to the cart successfully`,
                                    data : medicine3
                                })
                            }else{
                                res.status(200).send({
                                    success: false,
                                    message: "Somthing went wrong"
                                })
                            }
                        }else{
                            res.status(200).send({
                                success: false,
                                message: "Somthing went wrong"
                            })
                        }
                    }
                }
            }
            else{
                if(medicine.quantity <= 0){
                    res.status(200).send({
                        success: false,
                        message: "This medicine is out of stock"
                    })
                }
                else if(req.body.quantity>6){
                    res.status(200).send({
                        success: false,
                        message: "You cannot add quantity more than 6 at a time"
                    })
                }     
                else if(req.body.quantity > medicine.quantity){
                    res.status(200).send({
                        success: false,
                        message: "The quantity you want to add is not available in the stock right now please try again later"
                    })
                }
                else{
                    const medicine1 = await Medicine.findOneAndUpdate(
                        {_id : req.params.id},
                        {quantity : medicine.quantity - req.body.quantity},
                        {new : true}
                    )
                    if(medicine1){
                        const addMyCart = new Mycart({
                            user : req.user.id,
                            name : medicine.name,
                            company : medicine.company,
                            price : medicine.price * req.body.quantity,
                            pack_of : medicine.pack_of,
                            quantity : req.body.quantity
                        })
                        addMyCart
                        .save()
                        .then(
                            res.status(200).send({
                                success: true,
                                message: `${addMyCart.name} added to the cart successfully`,
                                data : addMyCart
                            })
                        )
                        .catch(err => {
                            res.status(500).send({
                                success: false,
                                message: err.message
                            })
                        })
                    }
                    else{
                        res.status(200).send({
                            success: false,
                            message: "Somthing went wrong"
                        })
                    }
                }
            }
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
// @route    /user/remove-from-cart/:id
// @desc     route for adding medicines in user's cart.
// @access   PUBLIC 
module.exports.userRemoveFromCart = async (req,res)=> {
    try{
        const medicineMyCart = await MyCart.findOneAndRemove({_id : req.params.id})
        if(medicineMyCart){
            const medicineMedicine = await Medicine.findOne({name : medicineMyCart.name})
            if(medicineMedicine){
                const medicineMedicine1 = await Medicine.findOneAndUpdate(
                    {name : medicineMedicine.name}, 
                    {quantity : medicineMedicine.quantity + medicineMyCart.quantity},
                    {new: true}
                )
                if(medicineMedicine1){
                    res.status(200).send({
                        success: true,
                        message: `${medicineMedicine1.name} removed from cart successfully`
                    })                   
                }
                else{
                    res.status(200).send({
                        success: false,
                        message: "Error in updating quantity of medicine"
                    })
                }
            }
            else{
                res.status(200).send({
                    success: false,
                    message: "No medicine found"
                })
            }
        }
        else{
            res.status(200).send({
                success: false,
                message: "No medicine found"
            })
        }
    }
    catch(err){
        res.status(500).send({
            success: false,
            message: err.message
        })
    }
}


// @type     POST
// @route    /user/my-cart
// @desc     route for showing user's cart.
// @access   PUBLIC
module.exports.userMyCart = async(req,res) => {
    try{
        const medicine = await Mycart.find({user : req.user.id})
        if(medicine){
            if(medicine.length>0){
                // var x = medicine.reduce((sum, current) => {
                //     return sum + current.price;
                //   }, 0)
                var sum = 0;
                for(i = 0 ; i<= medicine.length-1;i++){
                    var sum1 = sum + medicine[i].price
                    sum = sum1
                }
                var discountedPrice = sum - (sum*process.env.Discount/100)
                if(req.body.coupon === ""){
                    res.status(200).send({
                        success: true,
                        Total_Cart_Price: `Total price of your medicines is ₹${sum}`,
                        Discounted_Price : discountedPrice ,
                        medicines : medicine
                    })
                }
                else if(req.body.coupon !== process.env.Discount_Coupon){
                    res.status(200).send({
                        success : false,
                        message : "Please enter a valid coupen"
                    })
                }
                else if(sum < 200){
                    res.status(200).send({
                        success : false,
                        message : "This coupon will be applied only when the total amount is ₹200 or above"
                    })
                }
                else{
                    res.status(200).send({
                        success: true,
                        Total_Cart_Price: `Total price of your medicines is ₹${sum}`,
                        Discounted_Price : "₹"+discountedPrice,
                        Coupon : req.body.coupon + " Applied! ₹100 OFF",
                        Final_Price : "₹"+(discountedPrice - 100) ,
                        Medicines : medicine
                    })
                }
            }
            else{
                res.status(200).send({
                    success: true,
                    message: "Your cart is empty"
                })
            }
        }
        else{
            res.status(200).send({
                success: false,
                message: "Some error"
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
// @route    /user/signout
// @desc     route for signout of user.
// @access   PUBLIC
module.exports.userSignout = async(req,res)=> {
    try{
        const user = await User.findOneAndUpdate(
            {_id : req.user.id},
            {token: ""},
            {new : true}
        )
        if(user){
            res.status(200).send({
                success: true,
                message : "Signout Successfully",
            })
        }else{
            res.status(200).send({
                success: false,
                message : "User not found",
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
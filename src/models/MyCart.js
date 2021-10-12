const mongoose = require('mongoose');
const Schema = mongoose.Schema

const myCartSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "myUser"
    },
    name : {
        type : String,
        required : true,
        uppercase : true,
        trim: true
    },
    company : {
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true,
    },
    pack_of : {
        type : Number,
        required : true
    }
})

module.exports = Mycart = mongoose.model("myCart" , myCartSchema)
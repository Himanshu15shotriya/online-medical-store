const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    token : {
        type : String,
        default : ""
    }
})

module.exports = Admin = mongoose.model("myAdmin" , adminSchema)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin:{
        type:Schema.Types.ObjectId,
        default:("6151624067d0bf8a9ae8ee10")
    },
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    token:{
        type: String,
    }
})

module.exports = User = mongoose.model("myUser", userSchema)
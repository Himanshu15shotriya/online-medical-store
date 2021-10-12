const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicineSchema = new Schema({
    admin : {
        type : Schema.Types.ObjectId
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

module.exports = Medicine = mongoose.model("myMedicines" , medicineSchema)
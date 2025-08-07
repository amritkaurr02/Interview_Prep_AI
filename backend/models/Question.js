const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    session:{type:mongoose.Schema.Types.ObjectId, ref:"Session"},
    question : String,
    answer:String,
    note:{type:String,default:""},
    isPinned: {type:Boolean, default:false},
},{timestamps:true});

module.exports = mongoose.model("Question", questionSchema);
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    uid:{type:String,required:true},
    activity:{type:String,required:true},
    status:String,
    timetaken:Number,
    action:String,
    date:Date
});

module.exports = mongoose.model("todos",schema);
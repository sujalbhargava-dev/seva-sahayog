const mongoose = require("mongoose");

const eventSchema = new
mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type:String,
        requied:true 
    },
Date:{
    type:Date,
    required:true
},
location:{
    type:String,
    required:true
}
});

module.exports = mongoose.model("event",
eventSchema)
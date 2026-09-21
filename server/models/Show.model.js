import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    movie : {type : String , required : true, ref : "Movie"},
    showDateTime : {type : Date , required : true},
    showPrice : {type : Number , required : true},
    occupiedSeats : {type : Object ,default : {}},
}, {minimize : false, timestamps:true});
const Show = mongoose.model("Show", schema);
export default Show;
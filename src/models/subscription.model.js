import mongoose from "mongoose";
const subscriptionSchema=new Schema({
subscriber:{
    type:Schema.Types.ObjectId,
    ref:"User"
},
channel:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
},{timeStamps:true})
export const Subscription=mongoose.model("subscription",subscriptionSchema);
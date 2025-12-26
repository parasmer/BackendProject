import mongoose from "mongoose"
import {db_name} from "../constants.js"
const dbConnect=async ()=>{
try{
  console.log("MONGODB_URI: ", process.env.MONGODB_URI); 
// If this prints 'undefined', your .env is not loading.
const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`)
console.log(`\n DB connected Successfully! db host! :${connectionInstance.connection.host}`)
}
catch(err){
    console.log("error: ",err);
    process.exit(1);
}
}
export default dbConnect;
import dotenv from "dotenv"
dotenv.config({
   path:'./.env'
});
import dbConnect from "./db/index.js";
dbConnect();


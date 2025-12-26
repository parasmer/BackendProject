import express from "express"
import cors from "cors"

import cookieParser from "cookie-parser"
const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    crediantials:true
}))
// 3 major configurations 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) 

//routes

import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter)
// for redirecting to register,login option we dont have to write them here we can write them inside routes
// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login
export default app;
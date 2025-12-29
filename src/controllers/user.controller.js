import asyncHandler from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import apiResponse from "../utils/apiResponse.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken=async(userId)=>{
    try{
const user=await User.findById(userId)
const refreshToken=user.generateRefreshToken()
const accessToken=user.generateAccessToken()
user.refreshToken=refreshToken
await user.save({validBeforeSave:false})
return {accessToken,refreshToken}
    }
    catch(error){
        console.error("RefreshToken Error:", error)
        throw new apiError(500,"Something went wrong while generating refresh token")
    }
}
 const registerUser=asyncHandler(async(req,res)=>{
//get user details from frontend
//validation - not empty 
// check if user already exists; check by both email and username
// check for images and avataar
// upload them to cloudinary ,avatar
//create user Object - create entry in db
// remove password and refresh token field from response
//check for user creation 
// if user created return response else show error

const {username,fullName,email,password}= req.body
console.log("email: ",email);
console.log("password: ",password);
if([fullName,email,username,password].some((field)=>
field?.trim()==="")
){
throw new apiError(400, "All fields are Required")
}
// to check whether username or email exists
const exsisitedUser=await User.findOne({
    $or:[{username},{email}]
})
if(exsisitedUser){
throw new apiError(409,"User with email or username already exists")
}
const avatarLocalPath=req.files?.avatar[0]?.path;
const coverImageLocalPath=req.files?.coverImage[0]?.path;
if(!avatarLocalPath){
    throw new apiError(400,"Avatar file is required")
}
const avatar=await uploadOnCloudinary(avatarLocalPath)
const imagePath=await uploadOnCloudinary(coverImageLocalPath)
if(!avatar){
     throw new apiError(400,"Avatar file is missing")
}
const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:imagePath?.url||"",
    email,
    password,
    username:username.toLowerCase()
})
const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new apiError(500,"something went wromg while registering the user")
}
return res.status(201).json(
new apiResponse(200,createdUser,"user registered successfully")
)
})
 const loginUser=asyncHandler(async(req,res)=>{
    // req body ->data
    // username or email
    //find the user
    //password check
    //access and refresh token
    //send cookies
    // response send
    const {email,username,password}=req.body
    if(!(username || email)){
        throw new apiError(400,"Username or email is required")

    }

    const user=await User.findOne({
        //$ sign is mongodb operator
        // similar to username or email 
        $or:[{username},{email}]
    })
    if(!user){
        throw new apiError(404,"user doesn't exists");
    }
   const isPasswordValid= await user.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new apiError(401,"Invalid user credentials")
   }
   const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
   const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
   // sending cookies
   const options={
    //modified only through server not from frontend with httpOnly and secure true
    httpOnly:true,
    secure:true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new apiResponse(
        200,
        {
            user:loggedInUser,accessToken,
            refreshToken
        },
        "User logged In Successfully"
    )
   )
  
   
})

 const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged Out"))

   })
   const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken ||req.body.refreshToken
    if(!incomingRefreshToken){
        throw new apiError(401,"unathourized request")
    }
try {
    const decodedToken=jwt.verify(
         incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
       const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new apiError(401,"invalid refresh Token")
    }
    if(incomingRefreshToken!==user?.refreshToken){
    throw new apiError(401,"refresh token is expired or used")
    }
        const options={
            httpOnly:true,
            secure:true,
        }
       const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
       return res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newrefreshToken,options)
       .json(
        new apiResponse(
            200,
            {accessToken,refreshToken:newrefreshToken},
            "Access token refreshed"
        )
       )
} catch (error) {
    throw new apiError(401,error?.message || "invalid refresh Token")
    
}

   })
   export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
   }


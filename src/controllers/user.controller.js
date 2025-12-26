import asyncHandler from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import apiResponse from "../utils/apiResponse.js"
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
const exsisitedUser=User.findOne({
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
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase()
})
const createdUser=await User.findById(user_.id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new apiError(500,"something went wromg while registering the user")
}
return res.status(201).json(
new apiResponse(200,createdUser,"user registered successfully")
)
})
export default registerUser;
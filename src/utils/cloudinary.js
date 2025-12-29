import {v2 as cloudinary} from "cloudinary"
// importing file service
import fs from "fs"

console.log("Cloudinary Config Check:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
const uploadOnCloudinary=async (localfilePath)=>{
  try{
if(!localfilePath) return null
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
const response=await cloudinary.uploader.upload
(localfilePath,{
    resource_type: "auto"
})
//file has been uploaded successfully
console.log("file is uploaded on cloudinary",response.url);
return response;
  }  
  catch(err){
    console.log("CLOUDINARY UPLOAD ERROR: ", err);
    // it will remove the locally saved temporary file as the upload operation got failed
fs.unlinkSync(localfilePath);
return null;
  }
}
export default uploadOnCloudinary;
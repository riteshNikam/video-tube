import { v2 as cloudinary } from "cloudinary"; // import cloudinary
import { log } from "console";
import fs from 'fs'; // import file system inlcuded with node


// configuring cloudinary 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// creatign a utility function to upload file to cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        // localFilePath is file path on the local server
        if (!localFilePath) {
            return // if threre is no local path just return
        }
        const response =  await cloudinary.uploader.upload(localFilePath, {
            resource_type : 'auto'
        }) // store response
        // if localFilePath is uploaded on the server 
        // then remove the source from the local server
        fs.unlinkSync(localFilePath)
        return response // finally return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // if for some reason cloudinary fails still remove resource from the local server
        return null
    }
}

// creating a utility to delete resource on already stored in cloudinary
const deleteFromCloudinary = async (publicID) => {
    // public id is extracted from url 
    try {
        if (!publicID) {
            return // if there is no cloudinaryUrl simply return
        }
        // destroy the resource on the cloudinary and return response
        const result = await cloudinary.uploader.destroy(publicID, {
            resource_type : 'image'
        })

        return result

    } catch (error) {
        console.log(error.message)
        return
    }
}




export { uploadOnCloudinary, deleteFromCloudinary } // export utility
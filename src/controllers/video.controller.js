import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

const uploadVideo = asyncHandler(
    async (req, res) => {

        // get user
        // req.user is working bcoz of jwtVerify middle ware
        // only users who are logged in can upload video

        const user = await User.findById(req.user?._id)
        console.log(user);

        // get information from req.body
        const { title, description } = req.body

        // title and description are both mandotory field
        // user has to pass both title and description

        console.log(title, '---', description);

        if (!(title || description)) {
            throw new ApiError(400, 'title and description are both mandotory.')
        }

        // since we are sing uploade (multer) middleware
        // we also have access to req.files

        let localVideoPath
        if (req.files?.video) {
            localVideoPath = req.files.video[0].path
        }
        
        let localThumbnailPath
        if (req.files?.thumbnail) {
            localThumbnailPath = req.files.thumbnail[0].path
        }

        // both video and thumbnail are mandatory.
        if (!(localThumbnailPath && localVideoPath)) {
            throw new ApiError(400, 'Video and thumbnail are both mandatory.')
        }

        // upload the video and thumnail on cloudinary...

        // upload video
        const videoResponse = await uploadOnCloudinary(localVideoPath);
        
        // upload thumbnail 
        const thumbnailResponse = await uploadOnCloudinary(localThumbnailPath)

        if (!(videoResponse && thumbnailResponse)) {
            throw new ApiError(400, 'Something went wrong while uploading on cloudinary...')
        }

        const video = await Video.create({
            title : title,
            description : description,
            video : videoResponse?.url,
            thumbnail : thumbnailResponse?.url,
            duration : videoResponse?.duration,
            owner : user?._id
        })


        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    video
                }, 
                'Video uploaded successfully.'
            )
        )
    }
)

const deleteVideo = asyncHandler(
    async (req, res) => {
        
    }
)

export { uploadVideo }
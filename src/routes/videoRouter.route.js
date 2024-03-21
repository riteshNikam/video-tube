import express from "express"
import { jwtVerify } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import { uploadVideo } from "../controllers/video.controller.js"

const router = express.Router()

// add video route
router.route('/upload-video').post(
    jwtVerify, // only logged in users can upload the vidoe
    upload.fields( //from upload multer middleware 
    // this configures multer to take two files -- 1. video and 2. thumbnail
        [
            {
                name : 'video', 
                maxCount : 1
            }, 
            {
                name : 'thumbnail',
                maxCount : 1
            }
        ]
    ),
    uploadVideo // contoller 
)

export default router
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { userRegister, loginUser, logOut, refreshAccessToken, changePassword } from "../controllers/user.controller.js";

// creating a router instance
const router = Router()

// regiser route
router.route('/register').post(
    // using upload middleware this will anable form-data 
    // and we can upload files that can then be accessed using req.body object
    upload.fields(
        [
            {
                name : 'avatar',
                maxCount : 1
            },
            {
                name : 'coverImage',
                maxCount : 1
            }
        ]
    ),
    userRegister)

// add login route
router.route('/login').post(
    upload.none(), // if we do not set this then req.body won't accept form-data
    loginUser
)

// secure routes 
//------------------------------------------------
// add logout route
router.route('/logout').post(
    jwtVerify,
    logOut
)

// refresh token
router.route('/refresh-token').post(refreshAccessToken)

// change password
router.route('/change-password').post(
    jwtVerify,
    upload.none(),
    changePassword
)

export default router;
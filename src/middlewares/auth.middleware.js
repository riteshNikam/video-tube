import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

const jwtVerify = asyncHandler(
    async (req, res, next) => {
        try {

            // for a logged in user there will be corresponding cookies 
            // retrievong accesstoken cookie into token variable
            const token = req.cookies?.accessToken

            if (!token) {
                throw new ApiError(401, 'Unauthorised access token')
            }

            // decoding accessToken cookie payload
            const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_KEY)

            // finding corresponding user
            const user = await User.findById(decodedToken._id)

            if (!user) {
                throw new ApiError(401, 'Invalid access token')
            }

            // storing user in req object
            req.user = user

            next()
        } catch (error) {
            throw new ApiError(401, error?.message || "Invalid access token")
        }
    }
)

export { jwtVerify }
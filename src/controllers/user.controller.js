import { asyncHandler } from "../utils/asyncHandler.util.js"
import { ApiResponse } from '../utils/ApiResponse.util.js'
import { ApiError } from '../utils/ApiError.util.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.util.js"
import jwt from "jsonwebtoken"

// function to generate access and refresh tokens

const generateAccessAndRefereshTokens = async(userId) =>{
    try {

        const user = await User.findById(userId) // first get user by query
        const accessToken = user.generateAccessToken() // generate access token
        const refreshToken = user.generateRefreshToken() // generate refresh token

        user.refreshToken = refreshToken // update refresh token in the document
        await user.save({ validateBeforeSave: false }) // save document

        return {accessToken, refreshToken} // retrun tokens

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const userRegister = asyncHandler(
    async (req, res) => {

        // get user details from frontend
        // validation - not empty
        // check if user already exists: username, email
        // check for images, check for avatar
        // upload them to cloudinary, avatar
        // create user object - create entry in db
        // remove password and refresh token field from response
        // check for user creation
        // return res

        // getting input from frontend

        console.log(req.get('content-type'));
        const { userName, fullName, email, password } = req.body // req.body is used to take input from form or json...
        
        // validation
        if (
            [fullName, userName, email, password].some(field => field?.trim() === '')
        ) {
            throw new ApiError(500, 'All fields are compulsory');
        }

        // check if username and email exists
        const userExisted = await User.findOne(
            {
                $or : [{ userName }, { email }]
            }
        )

        if (userExisted) {
            throw new ApiError(500, 'User always existed')
        }

        // check if images exist

        // store path of the avatar image in avatarLocalPath
        let avatarLocalPath;
        if (req.files.avatar) {
            avatarLocalPath = req.files.avatar[0].path
        }

        // store path of coverImage in coverImageLocalPath
        let coverImageLocalPath;
        if (req.files.coverImage) {
            coverImageLocalPath = req.files.coverImage[0].path
        }       

        // avatar image is compulsory
        // if avatar image is not uploaded to local server 
        // throw error

        if (!avatarLocalPath) {
            throw new ApiError(500, 'Avatar is required...')
        }

        // upload avatar image on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)  
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)


        // create user object 
        const user = await User.create({
            fullName : fullName,
            userName : userName,
            password : password,
            avatar : avatar.url,
            coverImage : coverImage?.url || '',
            email : email
        })

        // this does two thing 
        // check if user is present in the dayabase
        // if present then remove password and refresh token 
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
 
        if (!createdUser) {
            throw new ApiError(500, 'USER NOT CREATED')
        }

        // retrun API response
        return res.status(200).json(
            new ApiResponse(
                200,
                {   
                    createdUser
                },
                'Success'
            )
        )
    }
)

const loginUser = asyncHandler(
    async (req, res) => {
        // get data from user
        // decide if login is based on userName, email or both,
        // find the user in databse
        // check if password is entered is correct
        // generate access and refresh token
        // store refresh token in the database
        // now store refresh and access token on the browser by using cookie

        // get data from user
        const {userName, email, password} = req.body

        // decide if login is based on userName, email or both
        if (!(userName || email)) {
            throw new ApiError(400, 'userName or email is reqired')
        }   

        // find the user in databse

        const user = await User.findOne({
            $or: [{userName}, {email}]
        })

        // check if password is entered is correct

        const isPasswordValid = await user.isPasswordCorrect(password)

        if (!isPasswordValid) {
            throw new ApiError(404, 'Password Incorrect')
        }

        // generate access and refresh token aand store refresh token in the database
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

        const logedInUser = await User.findById(user._id).select("-password -refreshToken")

         // now store refresh and access token on the browser by using cookie

        const cookie_options = {
            httpOnly : true,
            secure : true
        }

        // return response
        return res
         .status(200) // status
         .cookie('accessToken', accessToken, cookie_options) // save cookie to browser
         .cookie('refreshToken', refreshToken, cookie_options) // .cookie is available bcoz of cookie-parser middleware
         .json(
            new ApiResponse(200, // send a json respose
                {
                    logedInUser,
                    accessToken,
                    refreshToken
                },
                 'success')
        )
    }
)

const logOut = asyncHandler(

    // set refreshToken in the user document as undefined
    // destroy all cookies

    async (req, res) => {
        // findByIdAndUpdate is used to first find and then replace the refreshToken field.
        // req.user is comming from middleware
        // see userRouter /logout route.
        await User.findByIdAndUpdate(
            req.user._id, // id of the user
            {
                $unset: {
                    refreshToken: 1 // this removes the field from document
                } 
            },
            {
                new: true // this return updated document.
            }
        )

        // options for cookies.
        const options = {
            httpOnly: true,
            secure: true
        }
    
        // return response
        return res
        .status(200) // return with 200 status
        .clearCookie('refreshToken' ,options) // clear refreshToken cookie
        .clearCookie('accessToken' ,options) // clear accessToken cookie
        .json(new ApiResponse(200, {}, "User logged Out")) // json response 
    }
)

const refreshAccessToken = asyncHandler(
    async (req, res) => {
        const incomingRefreshToken = req.cookies?.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, 'unauthorised request')
        }

        try {
            const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_SECRET_KEY)
    
            const user = await User.findById(decodedToken._id)
    
            if (!user) {
                throw new ApiError(401, 'Invalid refresh token')
            }
    
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, 'refreshToken is expired or used')
            }
    
            const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
    
            const cookie_options = {
                httpOnly : true,
                secure : true
            }
    
            return res.status(200)
            .cookie('refreshToken', refreshToken, cookie_options)
            .cookie('accessToken', accessToken, cookie_options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken : accessToken,
                        refreshToken : refreshToken
                    },
                    'access token refreshed'
                )
            )
        } catch (error) {
            throw new ApiError(401, error.message || 'invalid refresh token')
        }
    }
)

const changePassword = asyncHandler(
    async(req, res) => {

        // take old paasword and newPassword as input
        const { oldPassword, newPassword } = req.body

        // we are using auth.middelware 
        // so req.user is available
        const user = await User.findById(req.user?.id)

        // check if the old password is correct
        const isPasswordValid = await user.isPasswordCorrect(oldPassword)

        // if not valid throw error
        if (!isPasswordValid) {
            throw new ApiError(400, 'Incorrect password')
        }

        // change password
        user.password = newPassword 

        // save
        await user.save({ validateBeforeSave : false })

        // return response
        return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                'Password change successfull'
            )
        )
    }
)

const getCurrentUser = asyncHandler(
    async(req, res) => {
        const user = req.user

        return res.json(200, {user}, 'Current user fetched successfully')
    }
)

const getUserChannelProfile = asyncHandler(
    async (req, res) => {

        // get username from url 
        const { userName } = req.params

        if (!userName?.trim()) {
            throw new ApiError(400, 'Username is missing')
        }

        // find username

        const channel = await User.aggregate(
            [
                {
                    $match : {
                        userName : userName?.toLowerCase()
                    }
                },
                {
                    $lookup : {
                        from : "subscriptions",
                        localField : "_id",
                        foreignField : "_id",
                        as : "subscribers"
                    }
                },
                {
                    $lookup : {
                        from : "subscriptions"
                    }
                }
            ]
        )
    }
)

export { userRegister, loginUser, logOut, refreshAccessToken, changePassword,  getCurrentUser };
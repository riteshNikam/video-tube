import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        userName : {
            type : String,
            required : true,
            lowercase : true,
            unique : true,
            trim : true,
            index : true
        },
        fullName : {
            type : String,
            required : true,
            trim : true,
            index : true
        }, 
        email : {
            type : String,
            requied : true,
            trime : true,
            lowercase : true,
            unique : true
        },
        avatar : {
            type : String, // from cloudinary
            required : true
        },
        coverImage : {
            type : String // from cloudinary
        },
        password : {
            type : String,
            required : true
        }, 
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        refreshToken : {
            type : String,
        }
    },
    { 
        timestamps : true 
    }
)


// pre hook callback runs just before the data is 'save' event occures
userSchema.pre('save', async function(next) {
    // this line check is password is modified
    // if this.isModified('password') --> true password is modified
    // means password was enterd once
    if (!this.isModified('password')) {
        return next() // if password modified then just move on to next middleware...
    }
    this.password = await bcrypt.hash(this.password, 10) // if password not modifed encrypt password using bcript
    next() // and then move to next middleware
})

// defining some custom methos for tokens


userSchema.methods.generateAccessToken = function() {
    const accessToken = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_EXPIRY
        }
    )
    return accessToken;
    
}

userSchema.methods.generateRefreshToken = function() {
    const refreshToken =  jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_SECRET_KEY,
        {
            expiresIn : process.env.REFRESH_EXPIRY
        }
    )
    return  refreshToken
}

// defining custom function to check password

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema);
import { ApiError } from "./ApiError.util.js"


const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next)
    } catch (error) {
        res.status(500).json({
            status : error.statusCode,
            message : error.message,
            success : error.success
        })   
    }
}

export { asyncHandler }
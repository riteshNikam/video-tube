class ApiError extends Error {
    constructor (
        statusCode,
        message = 'SOMETHING WENT WRONG',
        success = false
    ) {
        super()
        this.message = message,
        this.statusCode = statusCode,
        this.success = success
    }
}

export { ApiError }
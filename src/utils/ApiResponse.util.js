class ApiResponse {
    constructor (
        stutusCode,
        body,
        message = 'SUCCESS'
    ) {
        this.stutusCode = stutusCode,
        this.body = body,
        this.message = message,
        this.success = stutusCode < 400
    }
    
}

export { ApiResponse }
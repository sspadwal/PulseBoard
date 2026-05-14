class ApiError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode
        this.isOperational=true
        Error.captureStackTrace(this,this.constructor)
    }
    static badRequest(message="Bad Request"){
        return new ApiError(message,400)
    }

    static unauthorized(message="unauthorize"){
        return new ApiError(message,401)
    }

    static conflict(message = "conflict"){
        return new ApiError(message,409)
    }

    static forbidden(message = "forbidden"){
        return new ApiError(message,403)
    }

    static notfound(message = "notfound"){
        return new ApiError(message,404)
    }

    static internal(message = "Internal Server Error"){
        return new ApiError(message,500)
    }
}

export default ApiError;
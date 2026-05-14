import ApiError from "../utils/api-errors.js";

const errorMiddleware = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!(err instanceof ApiError)) {
        statusCode = 500;
        message = err.message || "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export default errorMiddleware;

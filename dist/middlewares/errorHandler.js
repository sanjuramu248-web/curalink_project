"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiError_1 = require("../utils/apiError");
const errorHandler = (err, _req, res, _next) => {
    let error = err;
    // Log error
    console.error(err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new apiError_1.ApiError(404, message);
    }
    // Mongoose duplicate key
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new apiError_1.ApiError(400, message);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new apiError_1.ApiError(400, message);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new apiError_1.ApiError(401, message);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new apiError_1.ApiError(401, message);
    }
    // Prisma errors
    if (err.code && err.code.startsWith('P')) {
        let message = 'Database error';
        let statusCode = 500;
        switch (err.code) {
            case 'P2002':
                message = 'Unique constraint violation';
                statusCode = 400;
                break;
            case 'P2025':
                message = 'Record not found';
                statusCode = 404;
                break;
            default:
                message = 'Database operation failed';
        }
        error = new apiError_1.ApiError(statusCode, message);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
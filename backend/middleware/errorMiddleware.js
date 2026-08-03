const logger = require('../utils/logger');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errorCode: err.statusCode,
    data: null,
    stack: err.stack,
    err: err
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.statusCode,
      data: null
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', { error: err });
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!',
      errorCode: 500,
      data: null
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Handle mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      error.message = `Invalid ${error.path}: ${error.value}.`;
      error.statusCode = 400;
      error.isOperational = true;
    }

    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      const value = error.message.match(/(["'])(\\?.)*?\1/)[0];
      error.message = `Duplicate field value: ${value}. Please use another value!`;
      error.statusCode = 400;
      error.isOperational = true;
    }

    // Handle mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      error.message = `Invalid input data. ${errors.join('. ')}`;
      error.statusCode = 400;
      error.isOperational = true;
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid token. Please log in again.';
      error.statusCode = 401;
      error.isOperational = true;
    }

    if (error.name === 'TokenExpiredError') {
      error.message = 'Your token has expired. Please log in again.';
      error.statusCode = 401;
      error.isOperational = true;
    }

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;

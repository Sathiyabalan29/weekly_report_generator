const errorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== "production" && error) {
    response.error = error.message;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorResponse;
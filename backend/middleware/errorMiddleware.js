const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("Global error:", err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const response = {
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFound,
  errorHandler,
};
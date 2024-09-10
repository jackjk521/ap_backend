const { StatusCodes } = require("http-status-codes");

const ApiResponse = require("../controllers/response/apiResponse");

const ApiErrorMiddleware = (e, req, res, next) => {
  const statusCode = e.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = e.message || "Internal Server Error";
  const errorObject = e.error || null;

  return res
    .status(statusCode)
    .json(ApiResponse(message, errorObject, statusCode, true));
};

module.exports = ApiErrorMiddleware;

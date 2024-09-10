const ApiError = require("../controllers/error/apiError");

const { StatusCodes } = require("http-status-codes");

const HandleNotFound = (req, res) => {
  const { method, path } = req;
  throw new ApiError(
    `${method} ${path} endpoint Not Found!`,
    StatusCodes.NOT_FOUND
  );
};

module.exports = HandleNotFound;

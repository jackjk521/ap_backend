function corsOptions() {
  return (req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  };
}

module.exports = {
  corsOptions,
};

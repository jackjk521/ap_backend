/*==============================
core packages
==============================*/
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
dotenv.config();

/*==============================
security and application logging packages
==============================*/
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("./middlewares/rateLimiterMiddleware");
const logger = require("morgan");

/*==============================
http & https Server
==============================*/
const http = require("http");
const https = require("https");

/*==============================
include middlewares, custom middlewares, Routes and Database connection
==============================*/
const Routes = require("./routes");
const constants = require("./config/constants");
const HandleNotFound = require("./middlewares/handleNotFoundMiddleware");
const HandleApiError = require("./middlewares/apiErrorMiddleware");
const ErrorLogger = require("./config/logger");

/*==============================
include environment variables
==============================*/
const ENVIRONMENT = process.env.ENVIRONMENT || "production";
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const SERVER_DOMAIN = process.env.SERVER_DOMAIN || "0.0.0.0";

/*==============================
server application configurations
==============================*/
// Initialize Express app
const app = express();

// Middleware setup
app.use(fileUpload());
app.use(logger(ENVIRONMENT === "development" ? "dev" : "common")); // log everything in console
app.use(logger("combined", ErrorLogger)); // log 4XX and 5XX in file
app.use(helmet());
app.use(xss());
app.use(constants.corsOptions());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply rate limiting only in production
if (ENVIRONMENT === "production") {
  app.use(rateLimiter);
}

/*==============================
routes, not found and custom api error handler
==============================*/
app.use("/api", Routes); // routes with /api prefix
app.use(HandleNotFound); // Not found handler
app.use(HandleApiError); // Custom API error handler

/*==============================
public endpoint for file/media access
==============================*/
app.use("/public", express.static(path.join(__dirname, "public")));

/*==============================
create http (development) server instance
==============================*/
const httpServer = http.createServer(app);

/*==============================
create https (production) server instance
==============================*/
let httpsServer;
if (ENVIRONMENT !== "development") {
  try {
    httpsServer = https.createServer(
      {
        key: fs.readFileSync("./config/ssl/privkeys.pem", "utf-8"),
        cert: fs.readFileSync("./config/ssl/full_chain.pem", "utf-8"),
      },
      app
    );
  } catch (error) {
    console.error(
      "Failed to start HTTPS server due to SSL certificate issue:",
      error
    );
    httpsServer = null;
  }
}

/*==============================
start server listen
==============================*/
if (ENVIRONMENT === "development") {
  // Start HTTP server in development mode
  httpServer.listen(HTTP_PORT, SERVER_DOMAIN, () => {
    console.log(
      `Development HTTP Server listening at http://${SERVER_DOMAIN}:${HTTP_PORT}`
    );
  });
} else {
  // Start HTTPS server in production, fallback to HTTP if HTTPS fails
  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, SERVER_DOMAIN, () => {
      console.log(
        `Production HTTPS Server listening at https://${SERVER_DOMAIN}:${HTTPS_PORT}`
      );
    });
  } else {
    console.warn(
      "Falling back to HTTP in production due to HTTPS setup failure."
    );
    httpServer.listen(HTTP_PORT, SERVER_DOMAIN, () => {
      console.log(
        `Production HTTP Server listening at http://${SERVER_DOMAIN}:${HTTP_PORT}`
      );
    });
  }
}

/*==============================
Graceful shutdown for both HTTP and HTTPS servers
==============================*/
const gracefulShutdown = () => {
  console.log("Shutting down server...");
  if (httpServer) {
    httpServer.close(() => console.log("HTTP server closed."));
  }
  if (httpsServer) {
    httpsServer.close(() => console.log("HTTPS server closed."));
  }
  process.exit(0);
};

// Catch shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// /*==============================
// core packages
// ==============================*/
// const fs = require("fs");
// const path = require("path");
// const dotenv = require("dotenv");
// const express = require("express");
// const fileUpload = require("express-fileupload");
// const cookieParser = require("cookie-parser");
// dotenv.config();

// /*==============================
// security and application logging packages
// ==============================*/
// const helmet = require("helmet");
// const cors = require("cors");
// const xss = require("xss-clean");
// const rateLimiter = require("./middlewares/rateLimiterMiddleware");
// const logger = require("morgan");

// /*==============================
// http & https Server
// ==============================*/
// const http = require("http");
// const https = require("https"); // for production use

// /*==============================
// include middlewares, custom middlewares, Routes and Database connection
// ==============================*/
// const Routes = require("./routes");
// // const DBConnect = require("./config/db");
// const constants = require("./config/constants");
// const HandleNotFound = require("./middlewares/handleNotFoundMiddleware");
// const HandleApiError = require("./middlewares/apiErrorMiddleware");
// const ErrorLogger = require("./config/logger");
// // const HttpsRequestOnly = require("./middlewares/HttpsRequestOnly"); // for production use

// /*==============================
// include environment variables
// ==============================*/
// const ENVIRONMENT = process.env.ENVIRONMENT || "production";
// const HTTP_PORT = process.env.HTTP_PORT || 3000;
// const HTTPS_PORT = process.env.HTTPS_PORT || 443; // for production use
// const SERVER_DOMAIN = process.env.SERVER_DOMAIN || null; // for production use

// /*==============================
// server application configurations
// ==============================*/
// // DBConnect();
// const app = express();
// app.use(fileUpload());
// app.use(logger(ENVIRONMENT === "development" ? "dev" : "common")); // log everything in console
// app.use(logger("combined", ErrorLogger)); // only log 4XX and 5XX in file
// app.use(helmet());
// app.use(xss());
// // app.use(rateLimiter);
// app.use(constants.corsOptions());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// // app.use(HttpsRequestOnly); // for production use

// /*==============================
// routes, not found and custom api error handler
// ==============================*/
// app.use("/api", Routes); // routes and prefix
// app.use(HandleNotFound); // endpoint not found response
// app.use(HandleApiError); // Custom API Error handler

// /*==============================
// public endpoint for file/media access
// ==============================*/
// app.use("/public", express.static(path.join(__dirname, "public")));

// /*==============================
// create http (development) server instance
// ==============================*/
// const httpServer = http.createServer(app);

// /*==============================
// create https (production) server instance
// ==============================*/
// const httpsServer =
//   ENVIRONMENT !== "development"
//     ? https.createServer(
//         {
//           key: fs.readFileSync("./config/ssl/privatekeys.pem", "utf-8"),
//           cert: fs.readFileSync("./config/ssl/ap_ec2_cert.pem", "utf-8"),
//           ca: fs.readFileSync("./config/ssl/ap_ec2_chain.pem", "utf-8"),
//         },
//         app
//       )
//     : http.createServer(app);

// /*==============================
// start server listen
// ==============================*/
// // httpServer.listen(HTTP_PORT, () => console.log("http server started!"));
// httpsServer.listen(HTTP_PORT, "0.0.0.0", async () => {
//   if (process.env.ENVIRONMENT === "development")
//     console.log(
//       "Development Server is listening on %s:%s",
//       httpsServer.address().address,
//       httpsServer.address().port
//     );
//   else
//     console.log(
//       "Production Server started!",
//       httpsServer.address().address,
//       httpsServer.address().port
//     );
// }); // for production use

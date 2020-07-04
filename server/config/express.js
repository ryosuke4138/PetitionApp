const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const rawBodyParser = require("../app/middleware/rawbodyparser");
const {
  allowCrossOriginRequestsMiddleware,
} = require("../app/middleware/cors.middleware");

// Determine correct body parser to use
const jsonParser = bodyParser.json();
const rawParser = rawBodyParser.rawParser;
const upload = multer({ limits: { fileSize: 20e6 } });
const multipartParser = upload.single("photo"); // 20 MB

function dynamicBodyParser(req, res, next) {
  const contentType = req.header("Content-Type") || "";
  console.log("parser");
  console.log(contentType);
  if (
    contentType === "image/jpg" ||
    contentType === "image/jpeg" ||
    contentType === "image/png" ||
    contentType === "image/gif" ||
    contentType === "text/plain"
  ) {
    console.log("content");
    console.log(contentType);
    rawParser(req, res, next);
  } else if (contentType.startsWith("multipart/form-data")) {
    multipartParser(req, res, next);
  } else {
    console.log("else");
    console.log(contentType);
    jsonParser(req, res, next);
  }
}

module.exports = function () {
  // Initialize Express
  const app = express();
  app.rootUrl = "/api/v1";

  // Middleware
  app.use(dynamicBodyParser);
  app.use(allowCrossOriginRequestsMiddleware);

  // Debug
  app.use((req, res, next) => {
    console.log(`##### ${req.method} ${req.path} #####`);
    next();
  });

  // Routes
  require("../app/routes/backdoor.routes")(app);
  require("../app/routes/users.routes")(app);
  require("../app/routes/petitions.routes")(app);

  return app;
};

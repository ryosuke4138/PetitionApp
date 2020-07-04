const users = require("../controllers/users.controllers");
const userPhoto = require("../controllers/users.photos.controller");

module.exports = function(app) {
  app.route(app.rootUrl + "/users/register").post(users.register);

  app.route(app.rootUrl + "/users/login").post(users.login);

  app.route(app.rootUrl + "/users/logout").post(users.logout);

  app
    .route(app.rootUrl + "/users/:userId")
    .get(users.read)
    .patch(users.edit);

  app
    .route(app.rootUrl + "/users/:userId/photo")
    .get(userPhoto.getPhoto)
    .put(users.loginRequired, userPhoto.putPhoto)
    .delete(users.loginRequired, userPhoto.removePhoto);
};

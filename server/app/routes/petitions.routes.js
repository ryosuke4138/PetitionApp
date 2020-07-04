const users = require("../controllers/users.controllers");
const petitions = require("../controllers/petitions.controllers");
const signatures = require("../controllers/signatures.petitions.controllers");
const petitionPhoto = require("../controllers/petitions.photos.controllers");

module.exports = function(app) {
  app
    .route(app.rootUrl + "/petitions")
    .post(users.loginRequired, petitions.create)
    .get(petitions.list);

  app
    .route(app.rootUrl + "/petitions/categories")
    .get(petitions.categoriesList);

  app
    .route(app.rootUrl + "/petitions/:petitionId")
    .get(petitions.read)
    .patch(
      users.loginRequired,
      petitions.loginByAuthorOfPetitionRequired,
      petitions.edit
    )
    .delete(
      users.loginRequired,
      petitions.loginByAuthorOfPetitionRequired,
      petitions.remove
    );

  app
    .route(app.rootUrl + "/petitions/:petitionId/signatures")
    .get(signatures.listSignatures)
    .post(users.loginRequired, signatures.createSignature)
    .delete(users.loginRequired, signatures.removeSignature);

  app
    .route(app.rootUrl + "/petitions/:petitionId/photo")
    .get(petitionPhoto.getPhoto)
    .put(users.loginRequired, petitionPhoto.putPhoto);
};

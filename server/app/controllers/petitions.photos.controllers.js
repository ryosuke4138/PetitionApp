const Photo = require("../models/petitions.photos.models");
const Petition = require("../models/petitions.models");
const fs = require("fs");

exports.getPhoto = async function (req, res) {
  const petitionId = req.params.petitionId;

  try {
    const filename = await Photo.getPhotoFilename(petitionId);
    if (filename == "Not Found") {
      res.statusMessage = filename;
      res.status(404).send();
      return;
    }
    const extend = filename.split(".")[1];
    console.log("Read a photo at " + "storage/photos/" + filename);
    fs.readFile("storage/photos/" + filename, function (err, data) {
      res.statusMessage = "OK";
      res
        .status(200)
        .contentType("image/" + extend)
        .send(data);
    });
  } catch (err) {
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.putPhoto = async function (req, res) {
  console.log(`Request to put a petition photo...`);

  const photo = req.body;
  const contentType = req.headers["content-type"];
  const userId = req.authenticatedUserId;
  const petitionId = req.params.petitionId;

  let extend = contentType.split("/")[1];
  extend = extend == "jpg" ? "jpeg" : extend;
  try {
    const petition = await Petition.getOneById(petitionId);
    if (petition == "Not Found") {
      res.statusMessage = petition;
      console.log(res.statusMessage);
      res.status(404).send();
      return;
    }

    if (["png", "jpeg", "gif"].indexOf(extend) == -1) {
      res.statusMessage = "Bad Request";
      console.log(res.statusMessage);
      console.log("should be png, jpeg, or gif");
      res.status(400).send();
      return;
    }

    if (petition.author_id != userId) {
      res.statusMessage = "Forbidden";
      console.log(res.statusMessage);
      res.status(403).send();
      return;
    }
    const filename = "storage/photos/petition_" + userId + "." + extend;
    fs.writeFile(filename, photo, async function (err) {
      await Photo.putPhoto(petitionId, userId + "." + extend);
      if (petition.photo_filename) {
        res.statusMessage = "OK";
        res.sendStatus(200);
      } else {
        res.statusMessage = "Created";
        res.sendStatus(201);
      }
      console.log(res.statusMessage);
    });
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

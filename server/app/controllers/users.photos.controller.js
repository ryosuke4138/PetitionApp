const Photo = require("../models/users.photos.models");
const User = require("../models/users.models");
const fs = require("fs");

exports.getPhoto = async function (req, res) {
  const userId = req.params.userId;

  try {
    const filename = await Photo.getPhoto(userId);
    if (filename == null) {
      res.statusMessage = "Not Found";
      res.status(404).send();
      return;
    }
    const extend = filename.split(".")[1];
    const filePath = "storage/photos/" + filename;
    fs.readFile(filePath, function (err, data) {
      console.log("Read a photo at " + filePath);
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
  const photo = req.body;
  const contentType = req.headers["content-type"];
  const userId = req.params.userId;

  let extend = contentType.split("/")[1];
  extend = extend == "jpg" ? "jpeg" : extend;
  try {
    const user = await User.getOne(userId);
    if (!user) {
      res.statusMessage = "Not Found";
      res.status(404).send();
      return;
    }

    if (["png", "jpeg", "gif"].indexOf(extend) == -1) {
      res.statusMessage = "Bad Request";
      res.status(400).send();
      return;
    }

    if (userId != req.authenticatedUserId) {
      res.statusMessage = "Forbidden";
      res.status(403).send();
      return;
    }
    const filePath = "storage/photos/user_" + userId + "." + extend;
    fs.writeFile(filePath, photo, async function (err) {
      await Photo.putPhoto(userId, extend);
      console.log("saved photo at " + filePath);
      if (user.photo_filename) {
        res.statusMessage = "OK";
        res.sendStatus(200);
      } else {
        res.statusMessage = "Created";
        res.sendStatus(201);
      }
    });
  } catch (err) {
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.removePhoto = async function (req, res) {
  const userId = req.params.userId;

  try {
    const result = await User.getOne(userId);
    if (!result || !result.photo_filename) {
      res.statusMessage = "Not Found";
      res.status(404).send();
      return;
    }
    if (userId != req.authenticatedUserId) {
      res.statusMessage = "Forbidden";
      res.status(403).send();
      return;
    }
    await Photo.removePhoto(userId);
    res.statusMessage = "OK";
    res.sendStatus(200);
    //delete from the directory here
  } catch (err) {
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

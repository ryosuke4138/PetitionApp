const Petition = require("../models/petitions.models");

exports.create = async function(req, res) {
  try {
    const newPetitionData = req.body;
    const userId = req.authenticatedUserId;

    if (newPetitionData.closingDate < new Date()) {
      res.statusMessage = "Bad Request";
      res.status(400).send("The closing date must be in the future.");
      return;
    }
    const result = await Petition.insert(userId, newPetitionData);

    if (result == "Bad Request") {
      res.statusMessage = result;
      res.status(400).send();
      return;
    }
    res.statusMessage = "Created";
    res.status(201).send(result);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.list = async function(req, res) {
  try {
    const result = await Petition.list(req.query);

    if (result == "Bad Request") {
      res.statusMessage = result;
      res.status(400).send();
      return;
    }
    res.statusMessage = "OK";
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.read = async function(req, res) {
  try {
    const petitionId = req.params.petitionId;
    const result = await Petition.read(petitionId);

    if (result == "Not Found") {
      res.statusMessage = result;
      res.status(404).send();
      return;
    }
    res.statusMessage = "OK";
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.edit = async function(req, res) {
  try {
    const newPetitionData = req.body;
    const userId = req.authenticatedUserId;

    if (newPetitionData.closingDate < new Date()) {
      res.statusMessage = "Bad Request";
      res.status(400).send("The closing date must be in the future.");
      return;
    }
    const result = await Petition.edit(userId, newPetitionData);

    if (result == "Bad Request") {
      res.statusMessage = result;
      res.status(400).send();
      return;
    }
    res.statusMessage = "OK";
    res.status(200).send();
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.remove = async function(req, res) {
  try {
    const petitionId = req.params.petitionId;
    await Petition.remove(petitionId);

    res.statusMessage = "OK";
    res.status(200).send();
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.categoriesList = async function(req, res) {
  try {
    const result = await Petition.getCategories();

    res.statusMessage = "OK";
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.loginByAuthorOfPetitionRequired = async function(req, res, next) {
  const petitionId = req.params.petitionId;
  const userId = req.authenticatedUserId;

  try {
    const result = await Petition.isPetitionCreatedByUser(userId, petitionId);
    if (result) {
      req.authenticatedUserId = result;
      next();
    } else {
      res.statusMessage = "Forbidden";
      res.status(403).send();
    }
  } catch (err) {
    res.statusMessage = "Internal Server Error";
    res
      .status(500)
      .send("Internal Server Error loginByAuthorOfPetitionRequired !!!!!");
  }
};

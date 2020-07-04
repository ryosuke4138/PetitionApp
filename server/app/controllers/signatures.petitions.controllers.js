// const Petition = require('../models/petitions.models')
const Signature = require("../models/signatures.petitions.models");

exports.listSignatures = async function(req, res) {
  try {
    const petitionId = req.params.petitionId;

    const result = await Signature.list(petitionId);

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

exports.createSignature = async function(req, res) {
  try {
    const petitionId = req.params.petitionId;
    const userId = req.authenticatedUserId;

    const result = await Signature.insert(userId, petitionId);

    if (result == "Forbidden") {
      res.statusMessage = result;
      res.status(403).send();
      return;
    }
    if (result == "Not Found") {
      res.statusMessage = result;
      res.status(404).send();
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

exports.removeSignature = async function(req, res) {
  try {
    const petitionId = req.params.petitionId;
    const userId = req.authenticatedUserId;

    const result = await Signature.remove(userId, petitionId);

    if (result == "Forbidden") {
      res.statusMessage = result;
      res.status(403).send();
      return;
    }
    if (result == "Not Found") {
      res.statusMessage = result;
      res.status(404).send();
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

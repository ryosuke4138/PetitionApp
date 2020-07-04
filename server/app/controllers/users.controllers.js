const User = require("../models/users.models");

exports.register = async function (req, res) {
  try {
    const newUserData = req.body;
    if (!isvalidEmail(newUserData) || !newUserData.password) {
      res.statusMessage = "Bad Request";
      res.status(400).send("Please enter a valid email address.");
      return;
    }
    const userId = await User.insert(newUserData);
    if (userId === "Bad Request") {
      res.statusMessage = "Bad Request";
      res.status(400).send();
      return;
    }
    res.statusMessage = "OK";
    res.status(201).send(userId);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.login = async function (req, res) {
  try {
    const userData = req.body;
    const result = await User.login(userData);
    if (result === -1) {
      res.statusMessage = "Bad Request";
      res.status(400).send("Please enter a valid email address.");
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

exports.logout = async function (req, res) {
  try {
    const token = req.get("X-Authorization");
    if (await User.logout(token)) {
      res.statusMessage = "OK";
      res.status(200).send();
    } else {
      res.statusMessage = "Unauthorized";
      res.status(401).send();
    }
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

exports.read = async function (req, res) {
  try {
    const userId = req.params.userId;
    const token = req.get("X-Authorization");
    const result = await User.read(userId, token);
    if (result === "Not Found") {
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

exports.edit = async function (req, res) {
  try {
    const newUserData = req.body;
    const token = req.get("X-Authorization");
    const userId = req.params.userId;
    if (newUserData.email && !isvalidEmail(newUserData)) {
      res.statusMessage = "Bad Request";
      res.status(400).send("Please enter a valid email address.");
      return;
    }
    const result = await User.edit(userId, token, newUserData);
    if (result === 0) {
      res.statusMessage = "Bad Request";
      res.status(400).send("no changes were provided");
      return;
    }
    if (result === "Unauthorized") {
      res.statusMessage = result;
      res.status(401).send();
      return;
    }
    if (result === "Forbidden") {
      res.statusMessage = result;
      res.status(403).send();
      return;
    }
    res.statusMessage = "OK";
    res.status(200).send(userId);
  } catch (err) {
    console.log(err);
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

function isvalidEmail(newUserData) {
  return newUserData.email && newUserData.email.includes("@");
}

exports.loginRequired = async function (req, res, next) {
  const token = req.header("X-Authorization");
  try {
    const result = await User.isAuthorized(token);
    if (result) {
      req.authenticatedUserId = result;
      next();
    } else {
      res.statusMessage = "Unauthorized";
      res.status(401).send();
    }
  } catch (err) {
    res.statusMessage = "Internal Server Error";
    res.status(500).send();
  }
};

const db = require("../../config/db");
const password = require("../common/password");
const cryptoRandomString = require("crypto-random-string");

async function insert(newUserData) {
  console.log(`Request to insert ${newUserData.name} into the database...`);

  if (await isEmailExists(newUserData.email)) {
    return "Bad Request";
  }

  newUserData.password = await password.hash(newUserData.password);
  const conn = await db.getPool().getConnection();
  const createSQL = `INSERT INTO User (name, email, password, city, country, photo_filename) VALUES (?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await conn.query(createSQL, [
      newUserData.name,
      newUserData.email,
      newUserData.password,
      newUserData.city,
      newUserData.country,
      newUserData.photo_filename
    ]);
    return { userId: result.insertId };
  } catch (err) {
    return -1;
  } finally {
    conn.release();
  }
}

async function login(userData) {
  console.log(`Request to login ${userData.email}...`);

  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM User WHERE email = ?`;
  const [result] = await conn.query(createSQL, [userData.email]);
  conn.release();
  if (result.length === 0) return -1;

  const isValidPassword = await password.compare(
    userData.password,
    result[0].password
  );
  if (!isValidPassword) return -1;

  const conn2 = await db.getPool().getConnection();
  const token = cryptoRandomString({ length: 10 });
  const userId = result[0].user_id;
  const createSQL2 = `UPDATE User SET auth_token = ? WHERE user_id = ?`;
  await conn2.query(createSQL2, [token, userId]);
  conn2.release();

  return {
    userId: userId,
    token: token
  };
}

async function logout(token) {
  console.log(`Request to logout...`);

  const conn = await db.getPool().getConnection();
  const createSQL = `UPDATE User SET auth_token = null WHERE auth_token = ?`;
  const [result] = await conn.query(createSQL, [token]);
  conn.release();
  return result.affectedRows === 1;
}

async function read(id, token) {
  console.log(`Request to get user ${id} from the database...`);

  const user = await getOne(id);
  if (!user) return "Not Found";
  if (id != (await isAuthorized(token))) {
    delete user.email;
  }
  return user;
}

async function edit(userId, token, newUserData) {
  console.log(`Request to edit user ${userId}...`);

  if (userId != (await isAuthorized(token))) {
    return "Unauthorized";
  }

  if (await isAuthorized(newUserData.email)) {
    return "Bad Request";
  }

  let affectedRows = 0;

  if (newUserData.name) {
    affectedRows += await editUserById(userId, "name", newUserData.name);
  }
  if (newUserData.email) {
    affectedRows += await editUserById(userId, "email", newUserData.email);
  }
  if (newUserData.city) {
    affectedRows += await editUserById(userId, "city", newUserData.city);
  }
  if (newUserData.country) {
    affectedRows += await editUserById(userId, "country", newUserData.country);
  }
  if (newUserData.photo_filename) {
    affectedRows += await editUserById(
      userId,
      "photo_filename",
      newUserData.photo_filename
    );
  }
  if (newUserData.password) {
    const user = await getOne(userId);
    if (
      !newUserData.currentPassword ||
      !(await password.compare(newUserData.currentPassword, user.password))
    ) {
      return "Forbidden";
    }
    affectedRows += await editUserById(
      userId,
      "password",
      newUserData.password
    );
  }
  return affectedRows;
}

async function editUserById(id, column, data) {
  const conn = await db.getPool().getConnection();
  const createSQL = "UPDATE User SET ".concat(column, ` = ? WHERE user_id = ?`);
  const [result] = await conn.query(createSQL, [data, id]);
  conn.release();
  return result.affectedRows || 0;
}

async function getOne(userId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM User WHERE user_id = ?`;
  const [result] = await conn.query(createSQL, [userId]);
  conn.release();
  return result ? result[0] : null;
}

async function isAuthorized(token) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM User WHERE auth_token = ?`;
  const [result] = await conn.query(createSQL, [token]);
  conn.release();
  return result.length > 0 ? result[0].user_id : false;
}

async function isEmailExists(email) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM User WHERE email = ?`;
  const [result] = await conn.query(createSQL, [email]);
  conn.release();
  return result.length > 0;
}

module.exports = {
  insert: insert,
  login: login,
  logout: logout,
  isAuthorized: isAuthorized,
  read: read,
  edit: edit,
  getOne: getOne
};

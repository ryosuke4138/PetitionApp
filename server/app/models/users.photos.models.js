const db = require("../../config/db");

exports.getPhoto = async function(userId) {
  console.log(`Request to retrieve a user's photo...`);

  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT photo_filename FROM User WHERE user_id = ?`;
  const [result] = await conn.query(createSQL, [userId]);
  conn.release();
  return result ? result[0].photo_filename : "Not Found";
};

exports.putPhoto = async function(userId, extend) {
  console.log(`Request to put a user's photo...`);

  const conn = await db.getPool().getConnection();
  const filename = userId + "." + extend;
  const createSQL = `UPDATE User SET photo_filename = ? WHERE user_id = ?`;
  await conn.query(createSQL, [filename, userId]);
  conn.release();
};

exports.removePhoto = async function(userId) {
  console.log(`Request to delete a user's photo...`);

  const conn = await db.getPool().getConnection();
  const createSQL = `UPDATE User SET photo_filename = null WHERE user_id = ?`;
  await conn.query(createSQL, [userId]);
  conn.release();
};

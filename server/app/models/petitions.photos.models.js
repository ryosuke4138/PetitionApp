const db = require("../../config/db");

exports.getPhotoFilename = async function(petitionId) {
  console.log(`Request to retrieve a petition photo...`);

  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT photo_filename FROM Petition WHERE petition_id = ?`;
  const [result] = await conn.query(createSQL, [petitionId]);
  conn.release();
  if (!result || !result[0]) return "Not Found";
  return result[0].photo_filename;
};

exports.putPhoto = async function(petitionId, filename) {
  const conn = await db.getPool().getConnection();
  const createSQL = `UPDATE Petition SET photo_filename = ? WHERE petition_id = ?`;
  await conn.query(createSQL, [filename, petitionId]);
  conn.release();
};

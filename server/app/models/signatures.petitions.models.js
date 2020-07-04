const db = require("../../config/db");

exports.list = async function(petitionId) {
  console.log(
    `Request to get all signatures of petition ${petitionId} from the database...`
  );

  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT 
    signatory_id AS signatoryId,
    User.name,
    User.city,
    User.country,
    signed_date + INTERVAL 13 HOUR AS signedDate 
    FROM Signature 
    JOIN Petition
    ON Signature.petition_id = Petition.petition_id 
    JOIN User
    ON Signature.signatory_id = User.user_id
    WHERE Signature.petition_id = ?
    ORDER BY signedDate ASC`;
  const [result] = await conn.query(createSQL, [petitionId]);
  conn.release();
  return result ? result : "Not Found";
};

exports.insert = async function(userId, petitionId) {
  console.log(
    `Request to create a signature of petition ${petitionId} from the database...`
  );

  const isValid = await isValidPetition(petitionId);
  if (isValid == "Not Found") return isValid;
  if (isValid == "Closed") return "Forbidden";
  if (await isSigned(userId, petitionId)) return "Forbidden";

  const conn = await db.getPool().getConnection();
  const createSQL = `INSERT INTO Signature (signatory_id, petition_id, signed_date) VALUES (?, ?, ?)`;
  const signed_date = new Date();
  await conn.query(createSQL, [userId, petitionId, signed_date]);
  conn.release();
};

async function isSigned(userId, petitionId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM Signature WHERE signatory_id = ? AND petition_id = ?`;
  const result = await conn.query(createSQL, [userId, petitionId]);
  conn.release();
  return result[0].length != 0;
}

async function isValidPetition(petitionId, userId = null) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT closing_date, author_id FROM Petition WHERE petition_id = ?`;
  const [petition] = await conn.query(createSQL, [petitionId]);
  conn.release();
  if (petition.length == 0) return "Not Found";
  else {
    if (petition[0].closing_date < new Date()) return "Closed";
    if (petition[0].author_id == userId) return "Created By User";
  }
  return;
}

exports.remove = async function(userId, petitionId) {
  console.log(
    `Request to create a signature of petition ${petitionId} from the database...`
  );

  const isValid = await isValidPetition(petitionId, userId);
  if (isValid == "Not Found") return isValid;
  if (isValid == "Closed") return "Forbidden";
  if (isValid == "Created By User") return "Forbidden";
  if (!(await isSigned(userId, petitionId))) return "Forbidden";

  const conn = await db.getPool().getConnection();
  const createSQL = `DELETE FROM Signature WHERE signatory_id = ? AND petition_id = ?`;
  await conn.query(createSQL, [userId, petitionId]);
  conn.release();
};

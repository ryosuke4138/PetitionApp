const db = require("../../config/db");

exports.insert = async function(userId, newPetitionData) {
  console.log(
    `Request to insert ${newPetitionData.title} into the database...`
  );

  if (!isCategoryIdExists()) return "Bad request";

  const conn = await db.getPool().getConnection();
  const createSQL = `INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) VALUES (?, ?, ?, ?, ?, ?)`;
  const created_date = new Date();
  const closing_date = new Date(newPetitionData.closingDate);
  try {
    const [result] = await conn.query(createSQL, [
      newPetitionData.title,
      newPetitionData.description,
      userId,
      newPetitionData.categoryId,
      created_date,
      closing_date
    ]);
    return { petitionId: result.insertId };
  } catch (err) {
    console.log("Bad request");
    return "Bad Request";
  } finally {
    conn.release();
  }
};

async function getCategories() {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT * FROM Category`;
  const [result] = await conn.query(createSQL);
  conn.release();
  return result;
}

async function isCategoryIdExists(categoryId) {
  for (category in await getCategories()) {
    if (categoryId == category.category_id) true;
  }
  return false;
}

exports.read = async function(petitionId) {
  console.log(`Request to get a petition ${petitionId} from the database...`);

  const petition = await getOne(petitionId);
  return petition.length != 0 ? petition[0] : "Not Found";
};

async function getOne(petitionId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT 
    Petition.petition_id AS petitionId, 
    title,
    description,
    author_id AS authorId,
    User.name AS authorName, 
    User.city AS authorCity, 
    User.country AS authorCountry, 
    (SELECT COUNT(*) FROM Signature WHERE Signature.petition_id = Petition.petition_id) AS signatureCount,
    Category.name AS category, 
    created_date + INTERVAL 13 HOUR AS createdDate,
    closing_date + INTERVAL 13 HOUR AS closingDate
    FROM Petition 
    JOIN Category 
    ON Petition.category_id = Category.category_id
    JOIN User
    ON Petition.author_id = User.user_id
    WHERE Petition.petition_id = ?`;
  const [result] = await conn.query(createSQL, [petitionId]);
  conn.release();
  return result;
}

exports.list = async function(query) {
  console.log(`Request to get all petitions...`);
  const startIndex = parseInt(query.startIndex) || 0;
  const q = query.q;
  const categoryId = query.categoryId;
  const authorId = query.authorId;
  const sortBy = query.sortBy;

  let additional_query = limitSQL(q, categoryId, authorId);
  additional_query += sortSQL(sortBy);
  if (
    !(startIndex >= 0) ||
    (categoryId && !categoryId > 0) ||
    (authorId && !authorId > 0) ||
    !additional_query
  )
    return "Bad Request";
  let petitions = await getAll(additional_query);
  const endIndex = startIndex + parseInt(query.count) || petitions.length;
  petitions = petitions.slice(startIndex, endIndex);
  return petitions;
};

async function getAll(additional_query) {
  const conn = await db.getPool().getConnection();
  const createSQL =
    `SELECT 
    Petition.petition_id AS petitionId, 
    title,
    Category.name AS category, 
    User.name AS authorName, 
    (SELECT COUNT(*) FROM Signature WHERE Signature.petition_id = Petition.petition_id) AS signatureCount
    FROM Petition 
    JOIN Category 
    ON Petition.category_id = Category.category_id
    JOIN User
    ON Petition.author_id = User.user_id
    ` + additional_query;
  const [result] = await conn.query(createSQL);
  conn.release();
  return result;
}

function limitSQL(q, categoryId, authorId) {
  let query = "";
  let isUsedWhere = false;
  if (q) {
    query += "WHERE title LIKE '%" + q + "%' ";
    isUsedWhere = true;
  }
  if (categoryId) {
    query +=
      (isUsedWhere ? "AND" : "WHERE") +
      " Petition.category_id = " +
      categoryId +
      " ";
    isUsedWhere = true;
  }
  if (authorId) {
    query +=
      (isUsedWhere ? "AND" : "WHERE") +
      " Petition.author_id = " +
      authorId +
      " ";
  }
  return query;
}

function sortSQL(sortBy) {
  const q = "ORDER BY ";
  const asc = " ASC, Petition.petition_id ASC";
  const desc = " DESC, Petition.petition_id ASC";
  if (sortBy == "ALPHABETICAL_ASC") return q + "title" + asc;
  if (sortBy == "ALPHABETICAL_DESC") return q + "title" + desc;
  if (sortBy == "SIGNATURES_ASC") return q + "signatureCount" + asc;
  if (!sortBy || sortBy == "SIGNATURES_DESC")
    return q + "signatureCount" + desc;
  return false;
}

exports.edit = async function(petitionId, newData) {
  console.log(`Request to edit a petition...`);

  if (!isCategoryIdExists()) return "Bad request";

  const additional_query = editSQL(newData);
  if (!additional_query) return "Bad request";

  const conn = await db.getPool().getConnection();
  const createSQL =
    `UPDATE Petition SET ` + additional_query + "WHERE petition_id = ?";
  await conn.query(createSQL, [petitionId]);
  conn.release();
};

function editSQL(newData) {
  let query = "";
  if (newData.title) {
    query += "title = " + newData.title;
  }
  if (newData.description) {
    query += (query ? ", " : "") + "description = " + newData.description;
  }
  if (newData.authorId) {
    query += (query ? ", " : "") + "author_id = " + newData.authorId;
  }
  if (newData.categoryId) {
    query += (query ? ", " : "") + "category_id = " + newData.categoryId;
  }
  if (newData.createdDate) {
    query += (query ? ", " : "") + "created_date = " + newData.createdDate;
  }
  if (newData.closingDate) {
    query += (query ? ", " : "") + "closing_date = " + newData.closingDate;
  }
  if (newData.photoFilename) {
    query += (query ? ", " : "") + "photo_filename = " + newData.photoFilename;
  }
  return query + " ";
}

exports.isPetitionCreatedByUser = async function(userId, petitionId) {
  const user = await getOne(petitionId);
  return userId == user[0].authorId;
};

exports.remove = async function(petitionId) {
  console.log(`Request to delete a petition...`);

  await deletePetition(petitionId);
  await deleteSignatures(petitionId);
};

async function deletePetition(petitionId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `DELETE FROM Petition WHERE petition_id = ?`;
  await conn.query(createSQL, [petitionId]);
  conn.release();
}

async function deleteSignatures(petitionId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `DELETE FROM Signature WHERE petition_id = ?`;
  await conn.query(createSQL, [petitionId]);
  conn.release();
}

exports.getCategories = async function() {
  console.log("Request to get all categories...");

  const conn = await db.getPool().getConnection();
  const createSQL = "SELECT category_id AS categoryId, name FROM Category";
  const result = await conn.query(createSQL);
  conn.release();
  return result ? result[0] : [];
};

exports.getOneById = async function(petitionId) {
  const conn = await db.getPool().getConnection();
  const createSQL = `SELECT 
    author_id,
    photo_filename
    FROM Petition 
    WHERE Petition.petition_id = ?`;
  const [result] = await conn.query(createSQL, [petitionId]);
  conn.release();
  return result.length != 0 ? result[0] : "Not Found";
};

import sql from 'mssql';
import { getPool } from './db.js';

async function addReview(filmid, rating, review, userID) {
  const pool = await getPool();
  let transaction;

  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    const result = await request
      .input('filmID', sql.Int, parseInt(filmid, 10))
      .input('rating', sql.Int, parseInt(rating, 10))
      .input('review', sql.NVarChar, review)
      .query(
        'INSERT INTO reviews (filmID, rating, review) VALUES (@filmID, @rating, @review); SELECT SCOPE_IDENTITY() AS ratingID;',
      );

    await request
      .input('userID', sql.Int, userID)
      .input('ratingID', sql.Int, result.recordset[0].ratingID)
      .query('INSERT INTO reviewowners (userID, ratingID) VALUES (@userID, @ratingID);');

    await transaction.commit();

    return result.recordset[0].ratingID;
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error executing query.', err);
    throw err;
  }
}

async function getUserReviewIds(userID) {
  const pool = await getPool();
  try {
    const result = await pool
      .request()
      .input('userID', sql.Int, userID)
      .query('SELECT ratingID FROM reviewowners WHERE userID = @userID');
    return result.recordset.map((record) => record.ratingID);
  } catch (err) {
    console.error('Error fetching review IDs:', err);
    throw err;
  }
}

async function getFilmIdByName(filmname) {
  const pool = await getPool();
  try {
    const result = await pool
      .request()
      .input('filmname', sql.NVarChar, filmname)
      .query('SELECT filmID FROM films WHERE title = @filmname');

    if (result.recordset.length > 0) {
      return result.recordset[0].filmID;
    }
    return null;
  } catch (err) {
    console.error('Error fetching film ID:', err);
    throw err;
  }
}

export { addReview, getUserReviewIds, getFilmIdByName };

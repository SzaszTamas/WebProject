import sql from 'mssql';
import { getPool } from './db.js';

const addFilm = async (title, releaseyear, description, genre, coverimage, userID) => {
  const pool = getPool();
  let transaction;

  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    const result = await request
      .input('title', sql.NVarChar, title)
      .input('releaseyear', sql.Int, parseInt(releaseyear, 10))
      .input('description', sql.NVarChar, description)
      .input('genre', sql.NVarChar, genre)
      .input('coverimage', sql.NVarChar, coverimage)
      .query(
        'INSERT INTO films (title, releaseyear, description, genre, coverimage) VALUES (@title, @releaseyear, @description, @genre, @coverimage); SELECT SCOPE_IDENTITY() AS filmID;',
      );

    const { filmID } = result.recordset[0];

    await request
      .input('filmID', sql.Int, filmID)
      .input('userID', sql.Int, userID)
      .query('INSERT INTO owners (filmID, userID) VALUES (@filmID, @userID);');

    await transaction.commit();
    return filmID;
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error executing query', err);
    throw err;
  }
};

export { addFilm };

import sql from 'mssql';
import { getPool } from './db.js';

export const searchFilms = async (title, genre, minYear, maxYear) => {
  try {
    const pool = getPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, `%${title || ''}%`)
      .input('genre', sql.NVarChar, genre || '')
      .input('minYear', sql.Int, minYear || 0)
      .input('maxYear', sql.Int, maxYear || 9999).query(`
        SELECT
          f.filmID,
          f.title,
          f.releaseYear,
          f.description,
          f.genre,
          f.coverImage,
          o.userID,
          (SELECT AVG(r.rating) FROM reviews r WHERE r.filmID = f.filmID) AS averageRating,
          (SELECT
              r.ratingID,
              r.rating,
              r.review
           FROM reviews r
           WHERE r.filmID = f.filmID
           FOR JSON PATH) AS reviews
        FROM films f
        JOIN owners o ON f.filmID = o.filmID
        WHERE
          (@title = '' OR f.title LIKE @title)
          AND (@genre = '' OR f.genre = @genre)
          AND (@minYear = 0 OR f.releaseYear >= @minYear)
          AND (@maxYear = 9999 OR f.releaseYear <= @maxYear)
      `);
    return result.recordset;
  } catch (err) {
    console.error('Error searching films:', err);
    throw err;
  }
};

export const getFilmById = async (filmId) => {
  try {
    const pool = getPool();
    const result = await pool.request().input('filmId', sql.Int, filmId).query(`
        SELECT
          f.filmID,
          f.title,
          f.releaseYear,
          f.description,
          f.genre,
          f.coverImage,
          (SELECT AVG(r.rating) FROM reviews r WHERE r.filmID = f.filmID) AS averageRating,
          ISNULL((
            SELECT STUFF((
              SELECT ', ' + CONVERT(NVARCHAR(5), r.rating) + ': ' + r.review
              FROM reviews r
              WHERE r.filmID = f.filmID
              FOR XML PATH('')
            ), 1, 2, '')
          ), '') AS reviews
        FROM films f
        WHERE f.filmID = @filmId
      `);
    return result.recordset[0] || null;
  } catch (err) {
    console.error('Error getting film by ID:', err);
    throw err;
  }
};

export const deleteReviewById = async (filmId, reviewIndex) => {
  const pool = await getPool();
  let transaction;

  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    const reviewsResult = await request.input('filmId', sql.Int, filmId).query(`
        SELECT r.ratingID
        FROM reviews r
        WHERE r.filmID = @filmId
        ORDER BY r.ratingID
      `);

    const reviewIDs = reviewsResult.recordset.map((record) => record.ratingID);

    if (reviewIndex >= 0 && reviewIndex < reviewIDs.length) {
      const ratingIdToDelete = reviewIDs[reviewIndex];

      await request.input('ratingID', sql.Int, ratingIdToDelete).query(`
          DELETE FROM reviewowners WHERE ratingID = @ratingID
        `);

      const deleteResult = await request.input('thisratingID', sql.Int, ratingIdToDelete).query(`
          DELETE FROM reviews WHERE ratingID = @thisratingID
        `);

      await transaction.commit();

      return deleteResult.rowsAffected[0] > 0;
    }

    await transaction.rollback();
    return false;
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error deleting review:', err);
    throw err;
  }
};

export const deleteGenreById = async (filmId) => {
  try {
    const pool = getPool();
    const result = await pool.request().input('filmId', sql.Int, filmId).query(`
      UPDATE films
      SET genre = NULL
      WHERE filmID = @filmId
    `);
    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error('Error deleting genre:', err);
    throw err;
  }
};

export const deletePlotById = async (filmId) => {
  try {
    const pool = getPool();
    const result = await pool.request().input('filmId', sql.Int, filmId).query(`
      UPDATE films
      SET description = NULL
      WHERE filmID = @filmId
    `);
    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error('Error deleting plot:', err);
    throw err;
  }
};

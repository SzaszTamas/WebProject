import sql from 'mssql';
import pkg from 'bcryptjs';
import { getPool } from './db.js';

const { hash } = pkg;

export const getUserByUsername = async (username) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('username', sql.VarChar, username)
    .query('SELECT * FROM users WHERE username = @username');
  return result.recordset[0];
};

export const getUserById = async (id) => {
  const pool = getPool();
  const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM users WHERE userID = @id');
  return result.recordset[0];
};

export const createUser = async (username, password) => {
  const hashedPassword = await hash(password, 10);
  const pool = getPool();
  const result = await pool
    .request()
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, hashedPassword)
    .query('INSERT INTO users (username, password) OUTPUT INSERTED.* VALUES (@username, @password)');
  return result.recordset[0];
};

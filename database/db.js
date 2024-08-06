import sql from 'mssql';

const config = {
  user: 'letmein',
  password: 'admin',
  database: 'filmek',
  server: 'localhost',
  pool: {
    max: 8,
    min: 0,
    idleTimeoutMillis: 1000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool = null;

export const connectToDb = async () => {
  try {
    if (!pool) {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('Connected to MSSQL');
    }
    return pool;
  } catch (err) {
    console.error('Database Connection Failed!', err);
    throw err;
  }
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

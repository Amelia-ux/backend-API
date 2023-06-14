const mysql = require("mysql");

const dbConfig = {
  host: process.env.DB_HOST || "34.126.92.65",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "capstone23",
  database: process.env.DB_NAME || "halodek-users",
};

const pool = mysql.createPool(dbConfig);

const releaseConnection = (connection) => {
  connection.release();
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((getConnectionErr, connection) => {
      if (getConnectionErr) {
        reject(getConnectionErr);
        return;
      }

      connection.query(sql, params, (queryErr, rows) => {
        releaseConnection(connection);

        if (queryErr) {
          reject(queryErr);
        } else {
          resolve(rows);
        }
      });
    });
  });
};

module.exports = {
  query,
  dbConfig,
};

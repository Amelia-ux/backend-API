const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const md5 = require("md5");
const { nanoid } = require("nanoid");

// Parse JSON request bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: YOUR_DB_HOST,
  user: YOUR_DB_USER,
  password: YOUR_DB_PASS,
  database: YOUR_DB_NAME,
});

router.post("/register", (req, res) => {
  const id = nanoid(16);
  const { username, email, password } = req.body;

  const selectQuery = "SELECT email FROM users WHERE email = ?";
  const selectValues = [email];

  pool.query(selectQuery, selectValues, (error, rows) => {
    if (error) {
      res.status(500).json({
        success: false,
        error: error,
      });
    } else {
      if (rows.length === 0) {
        const data = {
          id_user: "user-" + id,
          username: username,
          email: email,
          password: md5(password),
        };

        const insertQuery = "INSERT INTO users SET ?";
        pool.query(insertQuery, data, (error, result) => {
          if (error) {
            res.status(500).json({
              success: false,
              error: error,
            });
          } else {
            res.status(201).json({
              success: true,
              message: "Registration succeeded",
              data: {
                id_user: data.id_user,
                username: data.username,
                email: data.email,
              },
            });
          }
        });
      } else {
        res.status(409).json({
          success: false,
          message: "Email has been registered. Registration failed",
        });
      }
    }
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  const values = [username, md5(password)];

  pool.query(query, values, (error, rows) => {
    if (error) {
      res.status(500).json({
        success: false,
        error: error,
      });
    } else {
      if (rows.length === 1) {
        const id_user = rows[0].id_user;
        const username = rows[0].username;

        const data = {
          id_user: id_user,
          username: username,
        };

        res.status(200).json({
          success: true,
          userId: data.id_user,
          userName: data.username,
          message: "Login success",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Wrong username or password!",
        });
      }
    }
  });
});

module.exports = router;

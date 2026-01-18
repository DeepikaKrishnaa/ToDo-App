const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({
      success: false,
      message: "All fields are required"
    });
  }

  if (name.trim().length < 2) {
    return res.json({
      success: false,
      message: "Name must be at least 2 characters"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Invalid email format"
    });
  }

  if (password.length < 8) {
    return res.json({
      success: false,
      message: "Password must be at least 8 characters"
    });
  }

  const checkEmailSql = "SELECT id FROM users WHERE email = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("EMAIL CHECK ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }

    if (results.length > 0) {
      return res.json({
        success: false,
        message: "Email already registered. Try logging in."
      });
    }

    const insertSql =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(insertSql, [name.trim(), email, password], (err, result) => {
      if (err) {
        console.error("SIGNUP ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      res.json({
        success: true,
        userId: result.insertId
      });
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and password are required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.json({
      success: false,
      message: "Invalid email"
    });
  }

  const emailCheckSql = "SELECT * FROM users WHERE email = ?";
  db.query(emailCheckSql, [email], (err, results) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }

    if (results.length === 0) {
      return res.json({
        success: false,
        message: "Email not found. Try signing up."
      });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      userId: user.id
    });
  });
});

module.exports = router;

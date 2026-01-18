const express = require("express");
const router = express.Router();
const db = require("../db");


router.post("/tasks", (req, res) => {
  const { userId, title } = req.body;

  if (!userId || !title) {
    return res.json({
      success: false,
      message: "Task title is required"
    });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return res.json({
      success: false,
      message: "Task title cannot be empty"
    });
  }

  const sql =
    "INSERT INTO tasks (user_id, title, completed) VALUES (?, ?, false)";

  db.query(sql, [userId, trimmedTitle], (err, result) => {
    if (err) {
      console.error("TASK INSERT ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.json({
      success: true,
      taskId: result.insertId
    });
  });
});


router.get("/tasks/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY id ASC";

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("FETCH TASKS ERROR:", err);
      return res.status(500).json({ success: false });
    }

    res.json({
      success: true,
      tasks: results
    });
  });
});

router.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const { title } = req.body;

  if (!title) {
    return res.json({
      success: false,
      message: "Task title is required"
    });
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return res.json({
      success: false,
      message: "Task title cannot be empty"
    });
  }

  const sql = "UPDATE tasks SET title = ? WHERE id = ?";

  db.query(sql, [trimmedTitle, taskId], (err, result) => {
    if (err) {
      console.error("TASK UPDATE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (result.affectedRows === 0) {
      return res.json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true
    });
  });
});


router.put("/tasks/:id/completed", (req, res) => {
  const taskId = req.params.id;
  const { completed } = req.body;

  const sql = "UPDATE tasks SET completed = ? WHERE id = ?";

  db.query(sql, [completed ? 1 : 0, taskId], err => {
    if (err) {
      console.error("UPDATE COMPLETED ERROR:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});

router.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const userId = Number(req.query.userId);

  if (!userId) {
    return res.json({
      success: false,
      message: "User not authenticated"
    });
  }

  const userCheckSql = "SELECT id FROM users WHERE id = ?";
  db.query(userCheckSql, [userId], (err, userResults) => {
    if (err) {
      console.error("USER CHECK ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (userResults.length === 0) {
      return res.json({
        success: false,
        message: "User not authenticated"
      });
    }

    const taskCheckSql = "SELECT * FROM tasks WHERE id = ?";
    db.query(taskCheckSql, [taskId], (err, taskResults) => {
      if (err) {
        console.error("TASK CHECK ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Database error"
        });
      }

      if (taskResults.length === 0) {
        return res.json({
          success: false,
          message: "Task not found"
        });
      }

      const task = taskResults[0];

      if (task.user_id !== userId) {
        return res.json({
          success: false,
          message: "Not authorized to delete this task"
        });
      }

      const deleteSql = "DELETE FROM tasks WHERE id = ?";
      db.query(deleteSql, [taskId], (err) => {
        if (err) {
          console.error("TASK DELETE ERROR:", err);
          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }

        res.json({
          success: true
        });
      });
    });
  });
});

module.exports = router;
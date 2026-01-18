const express = require("express");
const app = express();
const cors = require("cors");
const taskRoutes = require("./routes/tasks");

app.use(express.json());
app.use(cors());
app.use("/api", taskRoutes);

const authRoutes = require("./routes/auth");

app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const express = require("express");
const app = express();

const userRoutes = require("./auth/user");
const uploadRoutes = require("./routes/upload");
const processRoutes = require("./routes/process");
const resultRoutes = require("./routes/result");

app.use("/user", userRoutes);
app.use("/upload", uploadRoutes);
app.use("/process", processRoutes);
app.use("/result", resultRoutes);

app.use("/upload", uploadRoutes);

module.exports = app;
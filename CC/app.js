const express = require("express");
const routes = require("./routes/record");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load routes
app.use("/api", routes);

app.get("/", (req, res) => {
  console.log("Response success")
  res.send("Response Success!")
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

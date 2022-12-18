require("dotenv").config();
const express = require("express");
const { default: helmet } = require("helmet");
const app = express();
const port = 3002 || process.env.PORT;
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");

const db = process.env.DB_URL;
// const db = "mongodb://localhost:27017/radiant_db";
require("./config/mongo.js")(db);
app.use(express.json()); //making sure the server can use json, this is use to make the app able to use json
app.use(helmet());
app.use(cors());

app.get("/", function (req, res) {
  res.setHeader("Content-Type", "text/html");
  res.end("<h1>Radiant Clothin API</h1>");
});
// routes
app.use("/", require("./routes/user.route"));
app.use("/admin", require("./routes/adminroutes/addcategory.route"));
app.use("/admin", require("./routes/adminroutes/products.route"));
// app.use("/admin", require("./routes/adminroutes/addcategory.route"));

server.listen(port, () => {
  console.log(`Listening on port:: http://localhost:${port}`);
});

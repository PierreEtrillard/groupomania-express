const express = require("express");
const app = express();
const mongoose = require("mongoose");
const usersRoutes = require("./routes/users");
const postsRoutes = require("./routes/posts");
const path = require("path");
// récupperation des identifiants de connection dans le fichier '.env'
const dotenv = require("dotenv");
dotenv.config();
const mongoPwd = process.env.mongoLogin;

mongoose
  .connect(mongoPwd, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connectée"))
  .catch((err) => {
    console.error(err);
  });
//***********************               ROUTES             *************************/
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use("/auth", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

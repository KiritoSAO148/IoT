const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client")));

module.exports = app;

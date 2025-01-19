const express = require('express');
const app = express();
require('dotenv').config();

//const app = require("express")();
app.use(express.json());
const fs = require("fs");

app.use("/js", express.static("./public/js"));
app.use("/img", express.static("./public/images"));
app.use("/css", express.static("./public/css"));

app.get('/api-key', (req, res) => {
    // send API key to the frontend
    const API_KEY = process.env.GOOGLE_PLACES_API;
    console.log(API_KEY);
    res.send({ apiKey: API_KEY });
  });

app.get("/", function (req, res) {
    let doc = fs.readFileSync("./public/index.html", "utf8");

    // just send the text stream
    res.send(doc);
});

// RUN SERVER
let port = 8000;
app.listen(port, function () {
    console.log("App listening at " + port + "!");
});
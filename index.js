const express = require('express');
const app = express();

//const app = require("express")();
app.use(express.json());
const fs = require("fs");

app.use("/js", express.static("./public/js"));
app.use("/img", express.static("./public/images"));
app.use("/css", express.static("./public/css"));

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
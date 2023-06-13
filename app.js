// const express is a function
const express = require("express");
const fs = require("fs");

// express app
// express() ist a function which creates an instance of the app
const app = express();

// register view engine
// .set lets us configure some application settings
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// middleware and static files
// in the folde public all files will be accessable at frontend.
app.use(express.static("public"));
app.use(express.static("projects"));

// listen for requests
app.listen(3000); // retuns an instance of the server
// we can store in a constand but we dont have to

// get requests
app.get("/:lang(de|en)/", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);
    res.render("index", { database: database[language] });
});

app.get("/:lang(de|en)/projects/:proj", (req, res) => {
    const language = req.params.lang;
    const project = req.params.proj;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);
    res.render("project", {
        language: language,
        database: database[language],
        proj_database: database[language]["projects"][project],
    });
});

app.get("/", (req, res) => {
    // now we render a view. renders index.ejs
    res.redirect("/de");
});

// const express is a function
const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb, makePipeline } = require("./db");
const fs = require("fs");

// express app
// express() ist a function which creates an instance of the app
const app = express();
app.use(express.json());

// register view engine
// .set lets us configure some application settings
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// middleware and static files
// in the folde public all files will be accessable at frontend.
app.use(express.static("public"));
//app.use(express.static("projects"));

// listen for requests
//app.listen(3000); // retuns an instance of the server
// we can store in a constand but we dont have to

// db connection
let db;
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log("app listening on port 3000");
        });
        db = getDb();
        console.log("connected to db");
    }
});

app.get("/:lang(de|en)/", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineIndex = makePipeline("index", language);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineIndex)
                .toArray()
                .then((result) => {
                    const indexPage = result[0];
                    res.status(200);
                    res.render("index", {
                        siteConfig: siteConfig,
                        indexPage: indexPage,
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch the documents" });
        });
});

app.get("/:lang(de|en)/about", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineAbouts = makePipeline("about", language);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("about")
                .aggregate(pipelineAbouts)
                .toArray()
                .then((result) => {
                    const abouts = result[0];
                    res.status(200);
                    res.render("about", {
                        siteConfig: siteConfig,
                        aboutPage: abouts,
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch the documents" });
        });
});

app.get("/:lang(de|en)/events", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineEventsPage = makePipeline("eventsPage", language);
    const pipelineEvent = makePipeline("event", language);
    let siteConfig;
    let pageConfig;
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineEventsPage)
                .toArray()
                .then((result) => {
                    pageConfig = result[0];
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not fetch pageConfig",
                    });
                });

            db.collection("events")
                .aggregate(pipelineEvent)
                .toArray()
                .then((result) => {
                    const events = result;
                    res.status(200);
                    res.render("events", {
                        siteConfig: siteConfig,
                        pageConfig: pageConfig,
                        events: events,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not fetch events",
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch siteConfig" });
        });
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

app.get("/:lang(de|en)/category=:cat", (req, res) => {
    const language = req.params.lang;
    const category = req.params.cat;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);
    res.render("category", {
        language: language,
        database: database[language],
        category: category,
    });
});

app.get("/:lang(de|en)/sand/:sandgrain", (req, res) => {
    const language = req.params.lang;
    const sand_grain = req.params.sandgrain;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);
    res.render("sandgrain", {
        language: language,
        database: database[language],
        sandgrain_database: database[language]["sand"]["entries"][sand_grain],
    });
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// app.get("/:lang(de|en)/about", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);
//     let links = ["/about-1", "/about-2"];
//     let images = ["cv_img_01.jpg", "cv_img_02.jpg"];

//     let linksShuffled = shuffleArray(links);
//     let imagesShuffled = shuffleArray(images);

//     res.render("about", {
//         language: language,
//         database: database[language],
//         linksShuffled: linksShuffled,
//         imagesShuffled: imagesShuffled,
//     });
// });

app.get("/:lang(de|en)/about-1", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);

    res.render("about-1", {
        database: database[language],
    });
});

app.get("/:lang(de|en)/about-2", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);

    res.render("about-2", {
        database: database[language],
    });
});

app.get("/:lang(de|en)/imprint", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);

    res.render("imprint", {
        database: database[language],
    });
});

// app.get("/:lang(de|en)/events", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("events", {
//         database: database[language],
//     });
// });

app.get("/:lang(de|en)/sand", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);
    res.render("sand", {
        database: database[language],
    });
});

app.get("/:lang(de|en)/contact", (req, res) => {
    const language = req.params.lang;
    let rawdata = fs.readFileSync("public/database.json");
    let database = JSON.parse(rawdata);

    res.render("contact", {
        database: database[language],
    });
});

app.get("/", (req, res) => {
    // now we render a view. renders index.ejs
    res.redirect("/en");
});

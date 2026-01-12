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

app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    next();
});

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
    const pipelineIndex = makePipeline("indexPage", language);
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
    const pipelineAbouts = makePipeline("aboutPage", language);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineAbouts)
                .toArray()
                .then((result) => {
                    const aboutPage = result[0];
                    res.status(200);
                    res.render("about", {
                        siteConfig: siteConfig,
                        aboutPage: aboutPage,
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

app.get("/:lang(de|en)/projects/:slug", (req, res) => {
    const language = req.params.lang;
    const slug = req.params.slug;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    // const pipelineCatPage = makePipeline("catPage", language);
    const pipelineProject = makePipeline("project", language, ["slug", slug]);
    let siteConfig;
    // let pageConfig;
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            siteConfig = result[0];
            db.collection("projects")
                .aggregate(pipelineProject)
                .toArray()
                .then((result) => {
                    const project = result[0];
                    res.status(200);
                    res.render("project", {
                        siteConfig: siteConfig,
                        project: project,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Could not fetch project",
                        details: err.message,
                    });
                });
        })
        .catch((err) => {
            res.status(500).json({
                error: "Could not fetch siteConfig",
                details: err.message,
            });
        });
});

app.get("/:lang(de|en)/category=:cat", (req, res) => {
    const language = req.params.lang;
    const category = req.params.cat;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineCatConfig = makePipeline("catConfig", language, category);
    const pipelineProject = makePipeline("project", language, [
        "cat",
        category,
    ]);
    let siteConfig;
    let catConfig;
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            siteConfig = result[0];
            db.collection("categories")
                .aggregate(pipelineCatConfig)
                .toArray()
                .then((result) => {
                    catConfig = result[0];
                    db.collection("projects")
                        .aggregate(pipelineProject)
                        .toArray()
                        .then((result) => {
                            const projects = result;
                            res.status(200);
                            res.render("category", {
                                siteConfig: siteConfig,
                                catConfig: catConfig,
                                category: category,
                                projects: projects,
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                error: "Could not fetch projects",
                                details: err.message,
                            });
                        });
                })
                .catch((err) => {
                    res.status(500).json({
                        error: "Could not fetch catConfig",
                        details: err.message,
                    });
                });
        })
        .catch((err) => {
            res.status(500).json({
                error: "Could not fetch siteConfig",
                details: err.message,
            });
        });
});

// app.get("/:lang(de|en)/sand/:sandgrain", (req, res) => {
//     const language = req.params.lang;
//     const sand_grain = req.params.sandgrain;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);
//     res.render("sandgrain", {
//         language: language,
//         database: database[language],
//         sandgrain_database: database[language]["sand"]["entries"][sand_grain],
//     });
// });

// function shuffleArray(array) {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

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

// app.get("/:lang(de|en)/about-1", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("about-1", {
//         database: database[language],
//     });
// });

// app.get("/:lang(de|en)/about-2", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("about-2", {
//         database: database[language],
//     });
// });

// app.get("/:lang(de|en)/imprint", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("imprint", {
//         database: database[language],
//     });
// });

// app.get("/:lang(de|en)/events", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("events", {
//         database: database[language],
//     });
// });

// app.get("/:lang(de|en)/sand", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);
//     res.render("sand", {
//         database: database[language],
//     });
// });

app.get("/:lang(de|en)/contact", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineContactPage = makePipeline("contactPage", language);
    let siteConfig;
    let pageConfig;
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineContactPage)
                .toArray()
                .then((result) => {
                    pageConfig = result[0];
                    res.render("contact", {
                        siteConfig: siteConfig,
                        pageConfig: pageConfig,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not fetch pageConfig",
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch siteConfig" });
        });
});

app.get("/:lang(de|en)/imprint", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineImprintPage = makePipeline("imprintPage", language);
    let siteConfig;
    let pageConfig;
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineImprintPage)
                .toArray()
                .then((result) => {
                    pageConfig = result[0];
                    res.render("imprint", {
                        siteConfig: siteConfig,
                        pageConfig: pageConfig,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not fetch pageConfig",
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch siteConfig" });
        });
});

// app.get("/:lang(de|en)/contact", (req, res) => {
//     const language = req.params.lang;
//     let rawdata = fs.readFileSync("public/database.json");
//     let database = JSON.parse(rawdata);

//     res.render("contact", {
//         database: database[language],
//     });
// });

app.get("/", (req, res) => {
    // now we render a view. renders index.ejs
    res.redirect("/en");
});

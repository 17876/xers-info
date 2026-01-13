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

app.get("/:lang(de|en)/sound-engineering", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pipelineSoundEngineering = makePipeline(
        "soundEngineeringPage",
        language
    );
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelineSoundEngineering)
                .toArray()
                .then((result) => {
                    const soundEngineeringPage = result[0];
                    res.status(200);
                    res.render("sound-engineering", {
                        siteConfig: siteConfig,
                        soundEngineeringPage: soundEngineeringPage,
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

app.get("/", (req, res) => {
    // now we render a view. renders index.ejs
    res.redirect("/en");
});

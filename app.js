if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb, makePipeline } = require("./db");
const { localizeLinks } = require("./utils");
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
//version with callback
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log("app listening on port 3000");
        });
        db = getDb();
        console.log("connected to db");
    }
});

//version with promise
// connectToDb()
//     .then(() => {
//         app.listen(3000, () => {
//             console.log("app listening on port 3000");
//         });
//         db = getDb();
//         console.log("connected to db");
//     })
//     .catch((err) => console.log(err));

app.get("/:lang(de|en)/", (req, res) => {
    console.log(process.env.NODE_ENV);
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pageFilter = { slug: "index" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    res.status(200);
                    res.render("index", {
                        siteConfig: siteConfig,
                        page: page,
                    });
                });
        })
        .catch((err) => {
            res.status(500).json({ error: "Could not fetch the documents" });
            console.log(err);
        });
});

app.get("/:lang(de|en)/about", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pageFilter = { slug: "about" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    console.log(pipelinePage);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    res.status(200);
                    res.render("about", {
                        siteConfig: siteConfig,
                        page: page,
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
    const pageFilter = { slug: "sound-engineering" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    res.status(200);
                    res.render("sound-engineering", {
                        siteConfig: siteConfig,
                        page: page,
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
    const pageFilter = { slug: "events" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    const pipelineEvent = makePipeline("event", language);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    db.collection("events")
                        .aggregate(pipelineEvent)
                        .toArray()
                        .then((result) => {
                            const events = result;
                            res.status(200);
                            res.render("events", {
                                siteConfig: siteConfig,
                                page: page,
                                events: events,
                                localizeLinks: localizeLinks,
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                error: err,
                            });
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

app.get("/:lang(de|en)/projects/:slug", (req, res) => {
    const language = req.params.lang;
    const slug = req.params.slug;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    let siteConfig;
    const projectFilter = { slug: slug };
    const pipelineProject = makePipeline("project", language, projectFilter);
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

// getting tags for the tags list on the page
app.get("/:lang(de|en)/tags", async (req, res) => {
    try {
        const { category } = req.query;
        const { lang } = req.params;

        // or category if it's a single field
        const filter = category ? { categories: category } : {};
        const tagKeys = await db
            .collection("projects")
            .distinct("tags", filter);

        //excluding tags which coincide with the category
        const tagKeysExcl = tagKeys.filter((tag) => tag !== category);

        const translations = await db
            .collection("tags")
            .find({ key: { $in: tagKeysExcl } })
            .toArray();

        const tags = tagKeysExcl.map((key) => {
            const t = translations.find((tr) => tr.key === key);
            return {
                key,
                label: t?.label?.[lang] || key,
            };
        });
        //sorting by label
        tags.sort((a, b) => a.label.localeCompare(b.label, lang));
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/:lang(de|en)/category=:cat", (req, res) => {
    const language = req.params.lang;
    const category = req.params.cat;
    const pipelineSiteConfig = makePipeline("siteConfig", language);

    let siteConfig;
    let catConfig;

    const { tags } = req.query;
    // console.log(req.query);
    let catFilter = { _id: category };
    let projFilter = { categories: category };

    const pipelineCatConfig = makePipeline("catConfig", language, catFilter);

    // If tags are provided
    if (tags) {
        const tagsArray = tags.split(",");
        projFilter.tags = { $in: tagsArray };
    }
    const pipelineProject = makePipeline("project", language, projFilter);
    const wantsJSON = req.headers.accept?.includes("application/json");
    //only projects with tags when using filter
    if (wantsJSON) {
        db.collection("projects")
            .aggregate(pipelineProject)
            .toArray()
            .then((result) => {
                const projects = result;
                res.status(200);
                res.json(projects);
            })
            .catch((err) => {
                res.status(500).json({
                    error: "Could not fetch projects",
                    details: err.message,
                });
            });
    } else {
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
    }
});

app.get("/:lang(de|en)/contact", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pageFilter = { slug: "contact" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            console.log(result);
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    res.render("contact", {
                        siteConfig: siteConfig,
                        page: page,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not render",
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch page" });
        });
});

app.get("/:lang(de|en)/imprint", (req, res) => {
    const language = req.params.lang;
    const pipelineSiteConfig = makePipeline("siteConfig", language);
    const pageFilter = { slug: "imprint" };
    const pipelinePage = makePipeline("page", language, pageFilter);
    db.collection("siteConfig")
        .aggregate(pipelineSiteConfig)
        .toArray()
        .then((result) => {
            const siteConfig = result[0];
            db.collection("pages")
                .aggregate(pipelinePage)
                .toArray()
                .then((result) => {
                    const page = result[0];
                    res.render("imprint", {
                        siteConfig: siteConfig,
                        page: page,
                    });
                })
                .catch(() => {
                    res.status(500).json({
                        error: "Could not render",
                    });
                });
        })
        .catch(() => {
            res.status(500).json({ error: "Could not fetch page" });
        });
});

app.get("/", (req, res) => {
    // now we render a view. renders index.ejs
    res.redirect("/en");
});

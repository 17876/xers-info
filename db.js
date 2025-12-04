const { MongoClient } = require("mongodb");

let dbConnection;
let uri = "mongodb://localhost:27017/antonstudio";

module.exports = {
    // for establishing connection to the db
    // argument to the function is callback. we pass as an argument another function cb. and this is the function we want to run after the connection is established.
    connectToDb: (cb) => {
        MongoClient.connect(uri)
            .then((client) => {
                dbConnection = client.db();
                return cb();
            })
            .catch((err) => {
                console.log(err);
                return cb(err);
            });
    },
    // returning this connection to the db. we use this value to communicate with the database.
    getDb: () => dbConnection,
    makePipeline: (type, language) => {
        if (type == "siteConfig") {
            let pipeline = [
                { $match: { _id: "siteConfig" } },
                {
                    $project: {
                        language: language,
                        website_title: `$website_title.${language}`,
                        website_title_short: `$website_title_short.${language}`,
                        nav: {
                            $map: {
                                input: "$nav",
                                as: "group",
                                in: {
                                    title: `$$group.title.${language}`,
                                    links: {
                                        $map: {
                                            input: "$$group.links",
                                            as: "link",
                                            in: {
                                                title: `$$link.title.${language}`,
                                                src: "$$link.src",
                                                css_class: "$$link.css_class",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        copyright: 1,
                    },
                },
            ];
            return pipeline;
        } else if (type == "about") {
            let pipeline = [
                { $match: { _id: "about" } },
                {
                    $project: {
                        language: language,
                        title: "$title",
                        about1: `$about1.${language}`,
                        about2: `$about2.${language}`,
                        about3: `$about3.${language}`,
                        about4: `$about4.${language}`,
                        about5: `$about5.${language}`,
                        about6: `$about6.${language}`,
                        about7: `$about7.${language}`,
                    },
                },
            ];
            return pipeline;
        } else if (type == "index") {
            let pipeline = [
                { $match: { _id: "index" } },
                {
                    $project: {
                        front_overlay_nav: {
                            img_src: "$front_overlay_nav.img_src",
                            description: "$front_overlay_nav.description",

                            overlay_links: {
                                $map: {
                                    input: "$front_overlay_nav.overlay_links",
                                    as: "item",
                                    in: {
                                        src: "$$item.src",
                                        color: "$$item.color",
                                        caption: `$$item.caption.${language}`,
                                        caption_coordinates:
                                            "$$item.caption_coordinates",
                                        paths: "$$item.paths",
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        } else if (type == "event") {
            let pipeline = [
                {
                    $project: {
                        past: 1,
                        title: 1,
                        projectLink: 1,

                        datetime: {
                            $cond: {
                                if: { $ne: ["$datetime", 0] },
                                then: {
                                    date: {
                                        $getField: {
                                            field: "date",
                                            input: {
                                                $getField: {
                                                    field: language,
                                                    input: "$datetime",
                                                },
                                            },
                                        },
                                    },
                                    time: {
                                        $getField: {
                                            field: "time",
                                            input: {
                                                $getField: {
                                                    field: language,
                                                    input: "$datetime",
                                                },
                                            },
                                        },
                                    },
                                },
                                else: 0,
                            },
                        },

                        venue: {
                            $cond: {
                                if: { $ne: ["$venue", 0] },
                                then: {
                                    $getField: {
                                        field: language,
                                        input: "$venue",
                                    },
                                },
                                else: 0,
                            },
                        },

                        subtitle: {
                            $getField: { field: language, input: "$subtitle" },
                        },

                        collab: {
                            $cond: {
                                if: { $ne: ["$collab", 0] },
                                then: {
                                    text: {
                                        $getField: {
                                            field: language,
                                            input: "$collab.text",
                                        },
                                    },
                                    who: "$collab.who",
                                },
                                else: 0,
                            },
                        },
                        description: `$description.${language}`,
                        extra: `$extra.${language}`,
                        link: 1,
                    },
                },
            ];
            return pipeline;
        } else if (type == "eventsPage") {
            let pipeline = [
                { $match: { _id: "eventsPage" } },
                {
                    $project: {
                        pageTitle: `$pageTitle.${language}`,
                    },
                },
            ];
            return pipeline;
        }
    },
};

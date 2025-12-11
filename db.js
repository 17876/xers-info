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
    makePipeline: (type, language, match = null) => {
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
        } else if (type == "aboutPage") {
            let pipeline = [
                { $match: { _id: "aboutPage" } },
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
        } else if (type == "indexPage") {
            let pipeline = [
                { $match: { _id: "indexPage" } },
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
        } else if (type == "contactPage") {
            let pipeline = [
                { $match: { _id: "contactPage" } },
                {
                    $project: {
                        pageTitle: `$pageTitle.${language}`,
                        text: 1,
                    },
                },
            ];
            return pipeline;
        } else if (type == "imprintPage") {
            let pipeline = [
                { $match: { _id: "imprintPage" } },
                {
                    $project: {
                        pageTitle: `$pageTitle.${language}`,
                        text: `$text.${language}`,
                    },
                },
            ];
            return pipeline;
        } else if (type == "catConfig") {
            let pipeline = [
                { $match: { _id: match } },
                {
                    $project: {
                        backgroundColor: 1,
                    },
                },
            ];
            return pipeline;
        } else if (type == "project") {
            matchObject = {};
            if (match[0] == "cat") {
                matchObject = { $match: { categories: match[1] } };
            } else if (match[0] == "slug") {
                matchObject = { $match: { slug: match[1] } };
            }

            let pipeline = [
                matchObject,
                {
                    $project: {
                        // unchanged
                        src: 1,
                        img_src: 1,
                        title: 1,
                        categories: 1,

                        // simple multilingual fields
                        subtitle: {
                            $getField: { field: language, input: "$subtitle" },
                        },
                        description: {
                            $getField: {
                                field: language,
                                input: "$description",
                            },
                        },

                        media: {
                            $map: {
                                input: "$media",
                                as: "m",
                                in: {
                                    type: "$$m.type",

                                    // multilingual label
                                    label: {
                                        $cond: {
                                            if: {
                                                $eq: [
                                                    { $type: "$$m.label" },
                                                    "object",
                                                ],
                                            },
                                            then: {
                                                $getField: {
                                                    field: language,
                                                    input: "$$m.label",
                                                },
                                            },
                                            else: "$$m.label",
                                        },
                                    },

                                    // Now handle 3 possible types
                                    src: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    {
                                                        $ne: [
                                                            "$$m.type",
                                                            "gallery",
                                                        ],
                                                    },
                                                    { $ne: ["$$m.src", null] },
                                                ],
                                            },
                                            then: "$$m.src",
                                            else: "$$REMOVE",
                                        },
                                    },

                                    // Handle gallery.images[] (nested array)
                                    images: {
                                        $cond: {
                                            if: {
                                                $eq: ["$$m.type", "gallery"],
                                            },
                                            then: {
                                                $map: {
                                                    input: "$$m.images",
                                                    as: "img",
                                                    in: {
                                                        src: "$$img.src",
                                                        style: "$$img.style",
                                                    },
                                                },
                                            },
                                            else: "$$REMOVE",
                                        },
                                    },
                                },
                            },
                        },
                        // meta section
                        meta: {
                            title: {
                                $getField: {
                                    field: language,
                                    input: "$meta.title",
                                },
                            },
                            items: {
                                $map: {
                                    input: "$meta.items",
                                    as: "it",
                                    in: {
                                        type: "$$it.type",

                                        label: {
                                            $getField: {
                                                field: language,
                                                input: "$$it.label",
                                            },
                                        },

                                        // value may be:
                                        //     a string-object (en/de)
                                        //     OR an array of objects containing text.en/de
                                        value: {
                                            $cond: [
                                                { $isArray: "$$it.value" },
                                                {
                                                    // array case (e.g. link-list)
                                                    $map: {
                                                        input: "$$it.value",
                                                        as: "val",
                                                        in: {
                                                            text: {
                                                                $getField: {
                                                                    field: language,
                                                                    input: "$$val.text",
                                                                },
                                                            },
                                                            src: "$$val.src",
                                                        },
                                                    },
                                                },
                                                {
                                                    // simple object case (e.g. value.en)
                                                    $getField: {
                                                        field: language,
                                                        input: "$$it.value",
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        }
    },
};

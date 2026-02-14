const { MongoClient } = require("mongodb");

let client;
let dbConnection;
const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 3000;

// adds language to local links to projects
function localizeLinks(html, lang) {
    return html.replace(/href="\/(?!https?)([^"]+)"/g, `href="/${lang}/$1"`);
}

module.exports = {
    // for establishing connection to the db
    // argument to the function is callback. we pass as an argument another function cb. and this is the function we want to run after the connection is established.
    //version woth promise
    // connectToDb: () => {
    //     return MongoClient.connect(uri)
    //         .then((connectedClient) => {
    //             client = connectedClient;
    //             dbConnection = client.db();
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         });
    // },

    //version with callback
    connectToDb: (cb) => {
        MongoClient.connect(uri)
            .then((connectedClient) => {
                client = connectedClient;
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
    getClient: () => client,
    closeDb: (cb) => {
        if (client) {
            client
                .close()
                .then(() => {
                    client = null;
                    dbConnection = null;
                    cb();
                })
                .catch((err) => cb(err));
        } else {
            cb();
        }
    },
    makePipeline: (type, language, filter = null) => {
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
                        overlay_nav: {
                            img_src: "$overlay_nav.img_src",
                            positioning: 1,
                            description: "$overlay_nav.description",
                            overlay_links: {
                                $map: {
                                    input: "$overlay_nav.overlay_links",
                                    as: "item",
                                    in: {
                                        id: "$$item.id",
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
                        text_blocks: {
                            $map: {
                                input: "$text_blocks",
                                as: "item",
                                in: {
                                    label: "$$item.label",
                                    value: `$$item.value.${language}`,
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        } else if (type == "soundEngineeringPage") {
            let pipeline = [
                { $match: { _id: "soundEngineeringPage" } },
                {
                    $project: {
                        language: language,
                        title: `$title.${language}`,
                        overlay_nav: {
                            img_src: "$overlay_nav.img_src",
                            positioning: 1,
                            description: "$overlay_nav.description",
                            overlay_links: {
                                $map: {
                                    input: "$overlay_nav.overlay_links",
                                    as: "item",
                                    in: {
                                        id: "$$item.id",
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
                        text_blocks: {
                            $map: {
                                input: "$text_blocks",
                                as: "item",
                                in: {
                                    label: "$$item.label",
                                    value: `$$item.value.${language}`,
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        } else if (type == "indexPage") {
            let pipeline = [
                { $match: { _id: "indexPage" } },
                {
                    $project: {
                        scroll_hint: `$scroll_hint.${language}`,
                        overlay_nav: {
                            img_src: "$overlay_nav.img_src",
                            description: "$overlay_nav.description",

                            overlay_links: {
                                $map: {
                                    input: "$overlay_nav.overlay_links",
                                    as: "item",
                                    in: {
                                        id: "$$item.id",
                                        src: "$$item.src",
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
                        subtitle: 1,
                        datetime: {
                            $cond: {
                                if: { $ne: ["$datetime", null] },
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
                                else: null,
                            },
                        },

                        venue: {
                            $cond: {
                                if: { $ne: ["$venue", null] },
                                then: {
                                    $getField: {
                                        field: language,
                                        input: "$venue",
                                    },
                                },
                                else: null,
                            },
                        },

                        subtitle: {
                            $getField: { field: language, input: "$subtitle" },
                        },

                        collab: {
                            $cond: {
                                if: { $ne: ["$collab", null] },
                                then: {
                                    label: {
                                        $getField: {
                                            field: language,
                                            input: "$collab.label",
                                        },
                                    },
                                    value: "$collab.value",
                                },
                                else: null,
                            },
                        },
                        description: `$description.${language}`,
                        extra: `$extra.${language}`,
                    },
                },
            ];
            return pipeline;
        } else if (type == "eventsPage") {
            let pipeline = [
                { $match: { _id: "eventsPage" } },
                {
                    $project: {
                        title: `$title.${language}`,
                    },
                },
            ];
            return pipeline;
        } else if (type == "contactPage") {
            let pipeline = [
                { $match: { _id: "contactPage" } },
                {
                    $project: {
                        title: `$title.${language}`,
                        text_blocks: {
                            $map: {
                                input: "$text_blocks",
                                as: "item",
                                in: {
                                    label: "$$item.label",
                                    value: `$$item.value.${language}`,
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        } else if (type == "imprintPage") {
            let pipeline = [
                { $match: { _id: "imprintPage" } },
                {
                    $project: {
                        title: `$title.${language}`,
                        text_blocks: {
                            $map: {
                                input: "$text_blocks",
                                as: "item",
                                in: {
                                    label: "$$item.label",
                                    value: `$$item.value.${language}`,
                                },
                            },
                        },
                    },
                },
            ];
            return pipeline;
        } else if (type == "catConfig") {
            let pipeline = [
                // { $match: { _id: filter } },
                { $match: filter },
                {
                    $project: {
                        backgroundColor: 1,
                        overlay_nav: {
                            img_src: "$overlay_nav.img_src",
                            positioning: 1,
                            description: "$overlay_nav.description",
                            overlay_links: {
                                $map: {
                                    input: "$overlay_nav.overlay_links",
                                    as: "item",
                                    in: {
                                        id: "$$item.id",
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
        } else if (type == "project") {
            let pipeline = [
                { $match: filter },
                {
                    $project: {
                        // unchanged
                        src: 1,
                        img_src: 1,
                        icon_src: 1,
                        title: 1,
                        categories: 1,
                        tags: 1,

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
                                        label: {
                                            $getField: {
                                                field: language,
                                                input: "$$it.label",
                                            },
                                        },
                                        value: {
                                            $map: {
                                                input: "$$it.value",
                                                as: "val",
                                                in: {
                                                    $getField: {
                                                        field: language,
                                                        input: "$$val",
                                                    },
                                                },
                                            },
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

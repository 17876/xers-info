const fs = require("fs");
const old_projects = require("./input");
const old_collection = old_projects.collection;

let new_projects = {};
new_projects.markdownFields = old_projects.markdownFields;
new_projects.collection = [];

for (const cur_project of old_collection) {
    let new_project = {};

    new_project._id = cur_project._id;
    new_project.slug = cur_project.slug;
    new_project.src = cur_project.src;
    new_project.img_src = cur_project.img_src;
    new_project.title = cur_project.title;
    new_project.subtitle = cur_project.subtitle;
    new_project.categories = cur_project.categories;
    new_project.tags = cur_project.tags;

    new_project.content = [];
    // dealing with media
    for (const cur_media of cur_project.media) {
        const cur_media_type = cur_media.type;
        let cur_block = {};

        if (cur_media_type == "img") {
            if (cur_media.label) {
                cur_block = {
                    type: cur_media_type,
                    label: {
                        en: cur_media.label,
                        de: cur_media.label,
                    },
                    src: cur_media.src,
                };
            } else {
                cur_block = {
                    type: cur_media_type,
                    label: {
                        en: "",
                        de: "",
                    },
                    src: cur_media.src,
                };
            }
        } else {
            cur_block = cur_media;
        }
        new_project.content.push(cur_block);
    }

    let cur_description = cur_project.description;
    // desription just empty, copy paste later from the old file because of the `` format.
    let cur_block = {
        type: "text",
        value: {
            en: cur_description.en,
            de: cur_description.de,
        },
    };
    new_project.content.push(cur_block);

    // dealing with meta
    const cur_meta = cur_project.meta;
    new_project.meta = cur_meta;

    new_projects.collection.push(new_project);
}

const fileContent = `projects = ${JSON.stringify(new_projects, null, 2)};\nmodule.exports = projects;`;
fs.writeFileSync("output.js", fileContent, "utf-8");

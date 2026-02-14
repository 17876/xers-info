if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const projects = require("./data/projects");
const events = require("./data/events");
const imprint = require("./data/pages");

const collections = {
    projects,
    events,
    pages,
};

const uri = process.env.MONGODB_URI;

const { MongoClient } = require("mongodb");
//for version with promise
// const { connectToDb, getDb, getClient, closeDb } = require("./db");

const { applyMarkdownFields } = require("./utils");

async function overwriteCollections() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        for (let [collectionName, data] of Object.entries(collections)) {
            const collection = db.collection(collectionName);

            const formattedCollection = data.collection.map((item) =>
                applyMarkdownFields(structuredClone(item), data.markdownFields),
            );

            await collection.deleteMany({});

            if (data.collection.length > 0) {
                await collection.insertMany(formattedCollection);
            }

            console.log(`Collection ${collectionName} fully overwritten.`);
        }
    } finally {
        await client.close();
    }
}

overwriteCollections();

// async function overwriteCollection() {
//     const client = new MongoClient(uri);
//     try {
//         await client.connect();
//         const db = client.db();
//         const collection = db.collection("projects");

//         const formattedProjects = projects.map((project) =>
//             applyMarkdownFields(structuredClone(project), markdownFields),
//         );

//         await collection.deleteMany({});

//         if (projects.length > 0) {
//             await collection.insertMany(formattedProjects);
//         }

//         console.log("Collection fully overwritten.");
//     } finally {
//         await client.close();
//     }
// }

// overwriteCollection();

//version with promise
// let db;
// let client;
// function overwriteCollection() {
//     let collection;
//     let formattedProjects;
//     connectToDb()
//         .then(() => {
//             db = getDb();
//             client = getClient();
//             console.log("connected to db");
//             collection = db.collection("projects");
//             formattedProjects = projects.map((project) =>
//                 applyMarkdownFields(structuredClone(project), markdownFields),
//             );
//         })
//         .then(() => {
//             return collection.deleteMany({});
//         })
//         .then(() => {
//             if (projects.length > 0) {
//                 return collection.insertMany(formattedProjects);
//             }
//             console.log("Collection fully overwritten.");
//         })
//         .then(() => {
//             client.close();
//         });
// }

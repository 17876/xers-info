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
};

const express = require("express");
const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 3001});

function fetchPosts(key, callback) {
    /**
     *  Open a connection to the database
     *  Send Query
     *  Return recordset
     **/
    let sql = require("mssql");
    let poolPromise = sql.connect({ // sql.connect if I don't give it a callback will return a promise
        server: "cisdbss.pcc.edu",
        database: "WebChat",
        user: "WebChat",
        password: "WebChat",
        options: {
            enableArithAbort: true,
            encrypt: false
        }
    });
    let recordsPromise = poolPromise.then((pool) => {
        return pool.request()
            .input('key', sql.NVarChar('MAX'), `%${key}%`)
            .query('SELECT * FROM Posts WHERE post LIKE @key;');
    });
    return recordsPromise.then((records) => records.recordset); // this is going to recordset from the promise
}

wss.on('connection', (ws, req) => {
    console.log("got connection");
    ws.on('message', (data) => {
        console.log(data);
        let msg = JSON.parse(data);
        if(msg.type == "search") {
            /* fetch matching posts from database */
            let resultsPromise  = fetchPosts(msg.key);
            resultsPromise.then((data) => {
                ws.send(JSON.stringify({
                    type: 'searchResults',
                    data: data
                }));
            });
        }
    });
});

express()
    .use(express.static(__dirname + '/public'))
    .listen(3000);

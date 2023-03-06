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
    sql.connect({
        server: "cisdbss.pcc.edu",
        database: "WebChat",
        user: "WebChat",
        password: "WebChat",
        options: {
            enableArithAbort: true
        }
    }, (err, pool) => { // callback connection to the database
        if(err) {
            callback(err)
        } else {
            pool.request()
                .input('key', sql.NVarChar('MAX'), `%${key}%`)
                .query('SELECT * FROM Posts WHERE post LIKE @key;', (err, results) => { //callback when I get results of the query
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results.recordset);
                    }
                });
        }
    });
}

wss.on('connection', (ws, req) => {
    console.log("got connection");
    ws.on('message', (data) => { // another event handler with event listener
        console.log(data);
        let msg = JSON.parse(data);
        if(msg.type == "search") {
            /* fetch matching posts from database */
            results  = fetchPosts(msg.key, (err, data) => { // asynchronous so have a callback to process the results when they arrive
                if(err) {
                    console.log(err);
                } else {
                    ws.send(JSON.stringify({
                        type: 'searchResults',
                        data: data
                    }));
                }
            })
        }

    });
});
express()
    .use(express.static(__dirname + '/public'))
    .listen(3000);
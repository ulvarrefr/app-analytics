const net = require('node:net');
const { log, response } = require("./lib/core.js");
// load ab test module routes
const { routes, init } = require("./cases/ab/index.js");

require("dotenv").config(); // load env variables from .env

const router = { ...routes };
const inits = [ init ];

inits.forEach( async x => await x() );

const server = net.createServer(c => {

    c.on("data", async m => {
        // check request length
        if (m.length > parseInt(process.env.MAX_REQ_SIZE)) {
            response(c, "ERROR", "REQUEST TOO LARGE");
        }

        // cleanup request
        let raw = m.toString().replace(/(\r\n|\n|\r)/gm, "");
        let msg;
        log(`<-- ${raw}`);

        // decode request maybe?

        // parse request
        try {
            msg = JSON.parse(raw);
        } catch (e) {
            response(c, "ERROR", "INVALID JSON");
            return;
        }

        // find route matches
        if (!msg.action) {
            response(c, "ERROR", "INVALID REQUEST FORMAT");
        } else if (!router[msg.action]) {
            response(c, "ERROR", "UNKNOWN ACTION");
        } else {
            router[msg.action](c,msg);
        }
    });
});

server.listen(process.env.SERVER_PORT,process.env.SERVER_HOST, () => {
    log(`SERVER STARTED on ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});




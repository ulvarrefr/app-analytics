const http = require("node:http");
const https = require("node:https");
const { readFile, rm } = require("node:fs/promises");
const { exec } = require("node:child_process");
const { promisify } = require("node:util");
const { log, response } = require("./lib/core.js");

// load .env to environment variables
require("dotenv").config();

async function init() {
    // read template one-time or die
    const tpl = await readFile("src/index.html", { encoding: "utf8" });

    // "carry" response function
    const r = (req,resp) => response(tpl,req,resp);

    if (process.env.SSL === "FALSE") {
        /*
          SSL=FALSE
          HTTP mode, no SSL.
        */
        http.createServer(r).listen(process.env.SERVER_PORT,process.env.SERVER_HOST);
    } else if (process.env.SSL === "KEYS") {
        /*
          SSL=KEYS
          Use pregenerated keys, letsencrypt or whatever you want.
          Keys must be set as SSL_KEY and SSL_CRT environment variables.
          Also you can use nginx/apache as proxy with their certs,
          in that case use SSL=FALSE option
        */
        // read keys or die
        const key = await readFile(process.env.SSL_KEY);
        const cert = await readFile(process.env.SSL_CRT);
        const options = { key, cert };
        https.createServer(options, r).listen(process.env.SERVER_PORT, process.env.SERVER_HOST);
    } else {
        /*
          SSL=TRUE or empty SSL environment variable.
          Use one-time generated self-signed keys.          
        */
        // generate keys
        await promisify(exec)('openssl req -new -newkey rsa:4096 -days 3650 -nodes -x509 -keyout ssl.key -out ssl.crt -subj "/C=US/ST=.../L=.../O=.../OU=.../CN=.../emailAddress=..."');
        // read and cleanup keys
        const key = await readFile("ssl.key");
        const cert = await readFile("ssl.crt");
        await rm("ssl.key");
        await rm("ssl.crt");
        const options = { key, cert };
        
        https.createServer(options, r).listen(process.env.SERVER_PORT, process.env.SERVER_HOST);
    }
}

init();

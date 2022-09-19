const { encrypt } = require("./crypt.js");


function log(str) {
    if (process.env.DEBUG === "TRUE") console.log(`${formatDateTime(new Date())}: ${str}`);
}

function response(conn, status, data) {
    let msg = `${JSON.stringify({ status, data })}`;    
    try {
        // encode message
        let encoded = encrypt(msg);
        encoded = JSON.stringify(encoded);
        conn.write(`${encoded}\r\n`);
        log(`--> ${msg}`);
    } catch (e) {
        log(`WRITE ERROR: ${e.toString()}`);
    }
    
    conn.end();
}

function formatDateTime(t) {
    return (new Date(t)).toUTCString();
}

module.exports = { log, response };

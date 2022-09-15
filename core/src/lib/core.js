
function log(str) {
    if (process.env.DEBUG === "TRUE") console.log(`${formatDateTime(new Date())}: ${str}`);
}

function response(conn, status, data) {
    let msg = `${JSON.stringify({ status, data })}`;    
    try {
        conn.write(`${msg}\r\n`);
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

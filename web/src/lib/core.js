
function log(str) {
    if (process.env.DEBUG === "TRUE") console.log(`${formatDateTime(new Date())}: ${str}`);
}

function response(tpl,req,res) {
    try {
        res.setHeader('Content-Type', 'text/html');
        res.write(tpl);
        res.end();
    } catch (e) {
        log(e.toString());
        res.write("Server Error");
        res.end();
    }
}

function formatDateTime(t) {
    return (new Date(t)).toUTCString();
}

module.exports = { log, response };

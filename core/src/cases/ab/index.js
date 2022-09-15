const { response } = require("../../lib/core.js");

module.exports.routes = {
    "echo": async (conn,req) => {
        response(conn,"OK");
    }
}

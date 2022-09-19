const { response, log } = require("../../lib/core.js");
const { connect, initSql, getUser, createUser, createVisit, createClick } = require("./db.js");

async function init () {
    await initSql();    
}

const routes = {
    "visit": async (sock,{ data }) => {
        let user;
        const conn = connect();
        try {
            if (data?.uid) {
                user = await getUser(data.uid, conn);
                if (!user) {
                    conn.end();
                    response(sock, "ERROR", "User not found");
                    return;
                }
            } else {
                user = await createUser(conn);
            }
            await createVisit(user, conn);
            const resp = data?.uid ? {} : { uid: user.id, group: user.group_name };
            response(sock, "OK", resp);
        } catch (e) {
            log(e.toString());
            response(sock, "ERROR", "Internal server error");
        }
        conn.end();
    },
    "click": async (sock, { data }) => {
        let user;
        const conn = connect();
        try {
            user = await getUser(data?.uid, conn);
            if (!user) {
                conn.end();
                response(sock, "ERROR", "User not found");
                return;
            }
            await createClick(user, conn);
            response(sock, "OK");
        } catch (e) {
            log(e.toString());
            response(sock, "ERROR", "Internal server error");                
        }
        conn.end();
    }
}

module.exports = { init, routes };

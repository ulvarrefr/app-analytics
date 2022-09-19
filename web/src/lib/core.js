const { createConnection } = require("node:net");

function log(str) {
    if (process.env.DEBUG === "TRUE") console.log(`${formatDateTime(new Date())}: ${str}`);
}

function apiCall(msg) {
    return new Promise((res,rej) => {
        const client = createConnection({ port: process.env.API_PORT, host: process.env.API_HOST }, () => {
            client.write(`${JSON.stringify(msg)}\r\n`);
        });
        client.on('data', (apiResp) => {
            client.end();
            const { status, data } = JSON.parse(apiResp);
            if (status === "OK") {
                res(data);
            } else {
                log(data);
                rej("API ERROR");
            }
        });
    });
}

async function response(tpl,req,res) {
    try {
        let user,uid,msg,cookie;
        if (req.url === "/") {            
            if (req.method === "GET") {
                /* Write VISIT event */
                cookie = parseCookie(req.headers);                
                if (cookie.redirect) {
                    /* Redirect from POST, do not write visit */
                    res.setHeader('Content-Type', 'text/html');
                    // unset redirect cookie
                    res.setHeader('Set-Cookie', 'redirect=;Max-Age=0');
                    // render template with data from cookie
                    res.write(processTpl(tpl,cookie));
                    res.end();                        
                } else {
                    /* Write new visit to api */
                    msg = {"action":"visit"};
                    // add user id to request if exists
                    if (cookie.uid) msg.data = { uid: cookie.uid };
                    // write visit api call
                    user = await apiCall(msg);
                    // setup cookie if unexist
                    if (!cookie.uid) {
                        res.setHeader("Set-Cookie", mkCookie(user));
                    }
                    res.setHeader('Content-Type', 'text/html');
                    // fill template with cookie value (new user) or returned value (user exists)
                    res.write(processTpl(tpl,cookie.uid ? cookie : user));
                    res.end();
                }            
            } else if (req.method === "POST") {
                /* Write CLICK event */    
                // get uid or die
                cookie = parseCookie(req.headers);
                if (!cookie.uid) throw "NO UID";
                msg = {"action":"click", data: { uid: cookie.uid }};
                // write click api call
                await apiCall(msg);
                // store redirect in cookie, we don't want write a visit after redirect
                res.setHeader("Set-Cookie", "redirect=1");
                res.statusCode = 302;
                res.setHeader('location', '/');
                res.end();
            } else {
                // do not serve other methods
                res.statusCode = 405;
                res.end();
            }
        } else {
            // do not serve none-root url
            res.statusCode = 404;
            res.end();
        }
    } catch (e) {
        log(e.toString());
        res.statusCode = 500;
        res.write("Server Error");
        res.end();
    }
}

function formatDateTime(t) {
    return (new Date(t)).toUTCString();
}

function processTpl(tpl,user) {
    /* Use predefined test group names, not group ids because possible auto increment issues */
    const color = user.group === "group#1" ? "red" : "blue";
    return tpl
        .replace(/\$UID/, user.uid)
        .replace(/\$GROUP_NAME/, user.group)
        .replace(/\$COLOR/, color);
}

function mkCookie({ uid, group, redirect }) {
    const maxAge = 60*60*24*30*12; // one year
    return `uid=${uid}__${group};Max-Age=${maxAge};`;
}

function parseCookie(headers) {
    let uid,group,redirect;
    if (headers.cookie) {
        headers.cookie.split("; ").forEach(x => {
            res = x.split("=");
            if (res.length > 0 && res[0] === "uid") {
                const line = res[1].split("__");
                uid = line[0];
                group = line[1];
            }
            //if (res.length > 0 && res[0] === "group_name") group = res[1];
            if (res.length > 0 && res[0] === "redirect") redirect = res[1];
        });
    }
    return { uid, group, redirect };
}

module.exports = { log, response };

const { response, log } = require("../../lib/core.js");
const mysql = require("mysql");
const { promisify } = require("node:util");
const { readFile } = require("node:fs/promises");

async function init () {
    // die if file not exists
    const sql = await readFile("src/cases/ab/sql/init.sql", { encoding: "utf8" });
    const connect = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        multipleStatements: true
    });
    const query = promisify(connect.query).bind(connect);
    // die if init sql have an error
    await query(sql);
    // add two test groups if unexists
    const res = await query("SELECT COUNT(*) AS count FROM groups;");
    if (!res[0].count) {
        await query("INSERT INTO groups (name) VALUES ('group#1'), ('group#2')");
    }
    connect.end();
}

const routes = {
    "echo": async (conn,req) => {
        response(conn,"OK");
    }
}

module.exports = { init, routes };

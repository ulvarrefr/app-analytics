const mysql = require("mysql");
const { readFile } = require("node:fs/promises");
const { promisify } = require("node:util");

function connect() {
    // return connection or die
    return mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
        database: process.env.MYSQL_DB,
        multipleStatements: true
    });
}

async function initSql() {
    /* Run sql init script. */
    
    // die if file not exists
    const initSql = await readFile("src/cases/ab/sql/init.sql", { encoding: "utf8" });
    const conn = connect();
    const query = promisify(conn.query).bind(conn);
    // die if init sql have an error
    await query(initSql);

    /* Run sql populate script if needed.
       Feel free to change populate_check and populate scripts,
       but populate_check must return a 'result' field.
    */
    
    // die if file not exists
    const populateCheckSql = await readFile("src/cases/ab/sql/populate_check.sql", { encoding: "utf8" });
    // die if query have an error
    const res = await query(populateCheckSql);
    if (!res[0].result) {
        // die if file not exists
        const populateSql = await readFile("src/cases/ab/sql/populate.sql", { encoding: "utf8" });
        // die if query have an error
        await query(populateSql);
    }
    conn.end();
}

async function getUser(uid, _conn) {
    const conn = _conn || connect();
    const query = promisify(conn.query).bind(conn);
    const res = await query("SELECT id,group_id FROM users WHERE id=?",[conn.escape(uid)]);
    return res[0];
}

async function createUser(_conn) {
    const conn = _conn || connect();
    const query = promisify(conn.query).bind(conn);
    // find a group with minimum users
    const res = await query("SELECT t.id,t.name,MIN(t.total) AS result FROM (SELECT groups.id,groups.name,COUNT(users.group_id) AS total FROM groups LEFT JOIN users ON groups.id=users.group_id GROUP BY users.group_id) t GROUP BY t.id ORDER BY result asc LIMIT 1;");
    // write user
    const res1 = await query(`INSERT INTO users (group_id) VALUES (${res[0].id});`);
    return { group_id: res[0].id, group_name: res[0].name, id: res1.insertId };
}

async function createVisit({ id, group_id }, _conn) {
    const conn = _conn || connect();
    const query = promisify(conn.query).bind(conn);
    await query(`INSERT INTO visit_events (group_id,user_id) VALUES (?,?);`,[conn.escape(group_id), conn.escape(id)]);
}

async function createClick({ id, group_id }, _conn) {
    const conn = _conn || connect();
    const query = promisify(conn.query).bind(conn);
    await query("INSERT INTO click_events (group_id,user_id) VALUES (?,?);",[conn.escape(group_id), conn.escape(id)]);
}

module.exports = { connect, initSql, getUser, createUser, createVisit, createClick };

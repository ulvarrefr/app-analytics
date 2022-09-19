## Requirements

If you want to use local MySQL server, you must install it. Otherwise no OS requirements.

Application used new node syntax for `require` function, so you must use at least 18.X node version.

## Install dependencies

`npm install`

## Run

`npm start`

## Configuration

Configuration options can be set as environment variables or in .env file.

**SERVER_PORT** Web-server binding port.

**SERVER_HOST** Web-server binding host.

**DEBUG** Set in TRUE if you want debug output.

**MAX_REQ_SIZE** Maximum request size.

**MYSQL_HOST**, **MYSQL_PORT**, **MYSQL_USER**, **MYSQL_PASS**, **MYSQL_DB** MySQL connection parameters.

**SECRET** Key for simple AES-256 requests and responses encryption. Must have a 32-bits length.

## API

### Description

All server API requests must be JSON encoded strings.

Each API request must have an `action` field, optionaly have a `data` field.

Each API response have a `status` field, optionaly have a `data` field.

If request was successed `status` field set in `OK`.

If request was failed `status` field set in `ERROR` with error description in `data` field.

Example API request: `{"action": "visit"}`.

Example API response: `{"status": "OK"}`.

### Actions

**visit** Creates a new `visit` event. If optional `data` field have an user `uid` field, it will be record in `visit_events` table and return no data, if not - new user will be created and returned as `data` field.

**click** Creates a new `click` event. `data` field and `uid` field must be present. Return no data.










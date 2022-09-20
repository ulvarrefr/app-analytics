## Description

**CORE** - Socket-based server with some user's event logic. See core/README.md

**WEB** - Web-server for user's interaction and socket client for interaction with CORE. See web/README.md

## Docker installation

`git clone https://github.com/ulvarrefr/app-analytics`

`cd app-analytics`

`docker build -t app-analytics-core ./core/`

`docker build -t app-analytics-web ./web/`

`docker-compose up`



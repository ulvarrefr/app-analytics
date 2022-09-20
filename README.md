## Description

**CORE** - Socket-based server with some user's event logic. See core/README.md

**WEB** - Web-server for user's interaction and socket client for interaction with CORE. See web/README.md

## Docker installation

`git clone https://github.com/ulvarrefr/app-analytics`

`cd app-analytics`

`docker build -t app_analytics_core ./core/`

`docker build -t app_analytics_core ./web/`

`docker-compose up`



# @pigtail - Docker Compose Demo

This Docker Compose stack is able to run the full @pigtail environment:

- Postgres data repository
- API Server (future UI Panel)
- Grafana
- Proxy Server
- Reaper Process (optional)

## Run All In Docker

    VERSION=0.0.5 humble up

## Run Local Reaper

First use Docker Compose to run the server stack:

    VERSION=0.0.5 humble up proxy

Then use NodeJS to run the reaper:

    npm install -g @pigtail/reaper@0.0.6
    pigtail start

# @pigtail - Docker Compose Demo

This Docker Compose stack is able to run the full @pigtail environment:

- Postgres data repository
- API Server (future UI Panel)
- Grafana
- Proxy Server
- Reaper Process (optional)

Run everything in Docker
------------------------

    VERSION=0.0.6 docker-compose up

Run the Reaper in NodeJS
------------------------

First use Docker Compose to run the server stack:

    VERSION=0.0.6 docker-compose up proxy

Then use NodeJS to run the reaper:

    npm install -g @pigtail/reaper@0.0.6
    pigtail start

Open Pigtail UI
---------------

At the moment *Pigtail* doesn't have its own UI, but we ship *Grafana* as visualization
tool and you can find some example dashboards in this folder.

[Open grafana](http://localhost:5050/grafana/login)

The first step is to **add the Postgres datasource**:

    host:      postgres:5432
    database:  postgres
    user:      postgres
    password:  postgres
    ssl-mode:  disable

Once you have a running connection you can then import one of the example boards.

1. From the left icon menu choose `Dashboards -> manage`
2. Click on the `import` button on the top right area
3. 


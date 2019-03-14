Pigtail
=======

Pigtail is a server and application monitoring system written in NodeJS. It is composed by:

##### barn

Docker/NodeJS app that offers a GraphQL API read/write data.  
Pigtail clients (*reapers*) use this API to send metrics, logs and events.

##### reaper

Docker/NodeJS app that runs on a host machine and is capable of collecting informations, and send them to a *barn* through the GraphQL API.

##### postgres

A *barn* stores data in *Postgres*, timeseries data are optimized by *TimescaleDB* extension.

##### grafana and boards

*Grafana* is a visualization tool that you can connect to the *Postgres* instance in order to create dashboards for your monitoring system.

*Boards* are a special *Grafana* instance that is capable of exposing public boards through a tough *NGiNX* configuration. But this is an experimental feature.

Development run
---------------

    make dev
    
Will start the `docker-compose.dev.yml` (using HumbleCLI) using all the default values for the environment variables.

> You can provide your custom values while running the command, or you can write them down in a `.env.local` file. HumbleCLI will read it for you.
> 

The entire system is exposed through an NGiNX proxy that is defaulted to port 5050:
  
    # Pigtail UI
    http://localhost:5050
    
    # Pigtail API
    http://localhost:5050/api
    
    # Grafana UI
    http://localhost:5050/grafana/login

All those services are configured with `NODE_ENV=development` and run through Docker with the source files as connected volumes.

This makes it optimal if you want to work on the barn/reaper with their default capabilities.

When you are done with your job, tear down the system with:

    make undev
    


Run single services in Development
----------------------------------
    
You can run single services and their dependencies via `make`:
    
    make barn
    make unbarn
    
    make app
    make unapp
    
    make reaper
    make unreaper
    
    make grafana
    make ungrafana
    
    make proxy
    make unproxy



Working on the Barn
-------------------

#### Backend

###### Run the backend via Docker

    make barn
    make unbarn
    
###### Run the backend via NodeJS
    
    # Run the Postgres service
    make db
    
    # Run the app
    cd services/barn
    yarn install
    yarn start:dev:api
    
An important step is to setup you environment correctly. In `services/barn/.env` you find a list of **commented environment variables** that the app needs in order to boot. The `.env` file is meant as a live documentation of the necessary variables, the app just won't boot without them.

Create a `.env.local` file and write there your custom values for development.


#### Frontend

If you are working on the *barn ui* you need to `make barn` so to run the backend, then you need to run the frontend project. Here you have 2 options:

###### Run the frontend via Docker

    make app
    make unapp
    
###### Run the frontend via NodeJS

    cd services/barn
    yarn install
    yarn start




Working on the Reaper
---------------------

When you work on the *reaper* you probably want to have a *barn* running, so that the *reaper* can send the data to it. (just run `make barn`).

###### Run the frontend via Docker

    make reaper
    make unreaper
    
###### Run the frontend via NodeJS

    cd services/reaper
    yarn install
    yarn start:dev

An important step is to setup you environment correctly. In `services/reaper/.env` you find a list of **commented environment variables** that the app needs in order to boot. The `.env` file is meant as a live documentation of the necessary variables, the app just won't boot without them.

Create a `.env.local` file and write there your custom values for development.




Local Production run with docker-compose
----------------------------------------

From the root of the project run:

    make prod
    make unprod
    
This will start all the services behind an *NGiNX* proxy.

An important step is to setup you environment correctly. In `.env` you find a list of commented environment variables that the app needs in order to boot. The .env file is meant as a live documentation of the necessary variables, the app just won’t boot without them.

Create a `.env.local` file and write there your custom values for production.





Production Run from DockerHub
-----------------------------

[Follow the white rabbit...](./public/README.md)


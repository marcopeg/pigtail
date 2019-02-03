#
# If you are about to go for a coffee run this command, it will force
# a full rebuild of the Docker images that are needed to run this project
#
prebuild:
	HUMBLE_ENV=dev humble pull
	HUMBLE_ENV=dev humble build --no-cache api
	HUMBLE_ENV=dev humble build --no-cache app
	HUMBLE_ENV=dev humble build --no-cache build
	HUMBLE_ENV=prod humble build --no-cache webapp

#
# Development Commands
#

db:
	HUMBLE_ENV=dev humble up -d postgres

dev: db
	HUMBLE_ENV=dev humble build api
	HUMBLE_ENV=dev humble up -d api
	HUMBLE_ENV=dev humble logs -f api

undev:
	HUMBLE_ENV=dev humble down

#
# Client App
#

app:
	HUMBLE_ENV=dev humble build app
	HUMBLE_ENV=dev humble up -d app
	HUMBLE_ENV=dev humble logs -f app

build:
	HUMBLE_ENV=dev humble build build
	HUMBLE_ENV=dev humble up build



#
# Production Commands
#

prod:
	HUMBLE_ENV=prod humble build webapp
	HUMBLE_ENV=prod humble up -d
	HUMBLE_ENV=prod humble logs -f

unprod:
	HUMBLE_ENV=prod humble down


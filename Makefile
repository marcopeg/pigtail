#
# If you are about to go for a coffee run this command, it will force
# a full rebuild of the Docker images that are needed to run this project
#
prebuild:
	HUMBLE_ENV=dev humble pull
	HUMBLE_ENV=dev humble build --no-cache api
	HUMBLE_ENV=dev humble build --no-cache app
	HUMBLE_ENV=dev humble build --no-cache build
	HUMBLE_ENV=dev humble build --no-cache daemon
	HUMBLE_ENV=prod humble build --no-cache webapp

db:
	HUMBLE_ENV=dev humble up -d postgres



#
# Api App
#

api: db
	HUMBLE_ENV=dev humble build api
	HUMBLE_ENV=dev humble up -d api
	HUMBLE_ENV=dev humble logs -f api

unapi:
	HUMBLE_ENV=dev humble stop api
	HUMBLE_ENV=dev humble rm -f api

#
# Client App
#

app: db
	HUMBLE_ENV=dev humble build app
	HUMBLE_ENV=dev humble up -d app
	HUMBLE_ENV=dev humble logs -f app

unapp:
	HUMBLE_ENV=dev humble stop app
	HUMBLE_ENV=dev humble rm -f app

build:
	HUMBLE_ENV=dev humble build build
	HUMBLE_ENV=dev humble up build

#
# Daemon App
#

daemon:
	HUMBLE_ENV=dev humble build daemon
	HUMBLE_ENV=dev humble up -d daemon
	HUMBLE_ENV=dev humble logs -f daemon

undaemon:
	HUMBLE_ENV=dev humble stop daemon
	HUMBLE_ENV=dev humble rm -f daemon

#
# Grafana App
#

grafana:
	HUMBLE_ENV=dev humble up -d grafana
	HUMBLE_ENV=dev humble logs -f grafana

ungrafana:
	HUMBLE_ENV=dev humble stop grafana
	HUMBLE_ENV=dev humble rm -f grafana





#
# Development Commands
#

dev: db
	HUMBLE_ENV=dev humble build api
	HUMBLE_ENV=dev humble build daemon
	HUMBLE_ENV=dev humble up -d api
	HUMBLE_ENV=dev humble up -d daemon
	HUMBLE_ENV=dev humble up -d grafana
	HUMBLE_ENV=dev humble logs -f api daemon

undev:
	HUMBLE_ENV=dev humble down


#
# Production Commands
#

prod:
	HUMBLE_ENV=prod humble build --no-cache
	HUMBLE_ENV=prod humble up -d
	HUMBLE_ENV=prod humble logs -f

unprod:
	HUMBLE_ENV=prod humble down


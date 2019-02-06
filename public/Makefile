
version?=0.0.2

serverPort?=5050
grafanaPassword?=grafana

pgDatabase?=postgres
pgUsername?=postgres
pgPassword?=postgres

hostName?=localhost
apiEndpoint?=http://barn:8080/api
apiToken?=xxx

barn:
	VERSION=${version} \
	SERVER_PORT=${serverPort} \
	GRAFANA_PASSWORD=${grafanaPassword} \
	PG_DATABASE=${pgDatabase} \
	PG_USERNAME=${pgUsername} \
	PG_PASSWORD=${pgPassword} \
	HOST_NAME=${hostName} \
	API_ENDPOINT=${apiEndpoint} \
	API_TOKEN=${apiToken} \
	docker-compose up -d postgres grafana barn proxy

reaper:
	VERSION=${version} \
	SERVER_PORT=${serverPort} \
	GRAFANA_PASSWORD=${grafanaPassword} \
	PG_DATABASE=${pgDatabase} \
	PG_USERNAME=${pgUsername} \
	PG_PASSWORD=${pgPassword} \
	HOST_NAME=${hostName} \
	API_ENDPOINT=${apiEndpoint} \
	API_TOKEN=${apiToken} \
	docker-compose up -d reaper

start: barn reaper
	VERSION=${version} \
	SERVER_PORT=${serverPort} \
	GRAFANA_PASSWORD=${grafanaPassword} \
	PG_DATABASE=${pgDatabase} \
	PG_USERNAME=${pgUsername} \
	PG_PASSWORD=${pgPassword} \
	HOST_NAME=${hostName} \
	API_ENDPOINT=${apiEndpoint} \
	API_TOKEN=${apiToken} \
	docker-compose logs -f barn reaper postgres grafana


down:
	VERSION=${version} \
	SERVER_PORT=${serverPort} \
	GRAFANA_PASSWORD=${grafanaPassword} \
	PG_DATABASE=${pgDatabase} \
	PG_USERNAME=${pgUsername} \
	PG_PASSWORD=${pgPassword} \
	HOST_NAME=${hostName} \
	API_ENDPOINT=${apiEndpoint} \
	API_TOKEN=${apiToken} \
	docker-compose down

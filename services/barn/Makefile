#
# Simple interface to run Docker!
#


# Running container's name
organization?=marcopeg
name?=rapha-barn
version?=0.0.4

# Docker image tag name
tag?=${name}

# Mish
loglevel?=info
host?=172.16.135.157
port?=5050
pgport?=5053
token?=xxx

# Build the project using cache
image:
	docker build -t ${tag} -t ${tag}:${version} .
	
# Spins up a container from the latest available image
# this is useful to test locally
run:
	docker run \
		--rm \
		--name ${name} \
		-p ${port}:8080 \
		-e PG_HOST=${host} \
		-e PG_PORT=${pgport} \
		-e PG_DATABASE=postgres \
		-e PG_USERNAME=postgres \
		-e PG_PASSWORD=postgres \
		-e LOG_LEVEL=${loglevel} \
		-e API_DEFAULT_TOKEN=${token} \
		${name}

stop:
	docker stop ${name}

remove:
	docker rm ${name}

# Like start, but in background
# classic way to launch it on a server
boot:
	docker run \
		-d \
		--name ${name} \
		-p 8080:8080 \
		${name}

down: stop remove

# Gain access to a running container
ssh:
	docker exec \
		-it \
		${name} \
		/bin/sh

publish:
	docker tag ${tag}:${version} ${organization}/${name}:${version}
	docker tag ${tag}:${version} ${organization}/${name}:latest
	docker push ${organization}/${name}:${version}
	docker push ${organization}/${name}:latest

release: image publish
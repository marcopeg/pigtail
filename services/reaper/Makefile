#
# Simple interface to run Docker!
#


# Running container's name
organization?=pigtail
name?=reaper
version:= $(shell node -p "require('../../pigtail.json').version")

# Docker image tag name
tag?=${name}

# Mish
loglevel?=info
host?=172.16.135.157
port?=5050
token?=xxx
hname?=localhost

# Build the project using cache
image:
	docker build -t ${tag} -t ${tag}:${version} .
	
# Spins up a container from the latest available image
# this is useful to test locally
run:
	docker run \
		--rm \
		--name ${name} \
		-e HOST_NAME=${hname} \
		-e API_ENDPOINT=http://${host}:${port}/api \
		-e API_TOKEN=${token} \
		-e LOG_LEVEL=${loglevel} \
		-v /var/lib/docker/containers:/var/lib/docker/containers \
        -v /var/run/docker.sock:/var/run/docker.sock \
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

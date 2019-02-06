#
# Simple interface to run Docker!
#


# Running container's name
organization?=marcopeg
name?=rapha-barn
version?=0.0.1

# Docker image tag name
tag?=${name}

# Build the project using cache
image:
	docker build -t ${tag} -t ${tag}:${version} .
	
# Spins up a container from the latest available image
# this is useful to test locally
run:
	docker run \
		--rm \
		--name ${name} \
		-p 5050:8080 \
		-e PG_HOST=172.16.135.157 \
		-e PG_PORT=5555 \
		-e PG_DATABASE=postgres \
		-e PG_USERNAME=postgres \
		-e PG_PASSWORD=postgres \
		-e LOG_LEVEL=verbose \
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

#
# Simple interface to run Docker!
#


# Running container's name
organization?=pigtail
name?=proxy
version:= $(shell node -p "require('../../pigtail.json').version")

# Docker image tag name
tag?=${name}

# Build the project using cache
image:
	docker build -t ${tag} -t ${tag}:${version} .


publish:
	docker tag ${tag}:${version} ${organization}/${name}:${version}
	docker tag ${tag}:${version} ${organization}/${name}:latest
	docker push ${organization}/${name}:${version}
	docker push ${organization}/${name}:latest

release: image publish

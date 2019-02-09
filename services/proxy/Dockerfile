FROM nginx:mainline-alpine

ARG DOCKERIZE_VER
ENV DOCKERIZE_VER ${DOCKERIZE_VER:-v0.6.1}
RUN echo "Dockerize version: ${DOCKERIZE_VER}"

RUN apk --update add curl \
    && curl -LO  https://github.com/jwilder/dockerize/releases/download/${DOCKERIZE_VER}/dockerize-alpine-linux-amd64-${DOCKERIZE_VER}.tar.gz \
    && tar xfvz dockerize-alpine-linux-amd64-${DOCKERIZE_VER}.tar.gz \
    && mv dockerize /usr/bin/dockerize \
    && apk del curl libcurl libssh2 ca-certificates \
    && rm -rf /var/cache/apk/*


COPY nginx.conf.tmpl /app/nginx.conf.tmpl

# Protect Grafana Proxy
ENV GRAFANA_ENABLED "true"

# Protect Public Boards Proxy
ENV BOARDS_ENABLED "false"
ENV BOARDS_USER "public@gopigtail.com"
ENV BOARDS_TOKEN "xxx"
ENV BOARDS_COOKIE_NAME "pigtail-public-boards"
ENV BOARDS_COOKIE_MAX_AGE "10000"

CMD ["/usr/bin/dockerize", "-template", "/app/nginx.conf.tmpl:/etc/nginx/nginx.conf", "nginx"]

ARG BASE
FROM ${BASE}

COPY etc/k8s.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /opt/pi-k8s

WORKDIR /opt/pi-k8s

ADD www www

MACHINE=$(shell uname -m)
IMAGE=pi-k8s-fitches-chore-gui
VERSION=0.1
TAG="$(VERSION)-$(MACHINE)"
ACCOUNT=gaf3
NAMESPACE=fitches
VOLUMES=-v ${PWD}/www/:/opt/pi-k8s/www/ -v ${PWD}/etc/docker.conf:/etc/nginx/conf.d/default.conf
PORT=6771

ifeq ($(MACHINE),armv7l)
BASE=arm32v7/nginx
else
BASE=nginx:1.15.7-alpine
endif

.PHONY: build shell run push create update delete create-dev update-dev delete-dev

build:
	docker build . --build-arg BASE=$(BASE) -t $(ACCOUNT)/$(IMAGE):$(TAG)

shell:
	docker run -it $(VOLUMES) $(ACCOUNT)/$(IMAGE):$(TAG) sh

run:
	docker run -it --rm $(VOLUMES) -p $(PORT):80 -h $(IMAGE) $(ACCOUNT)/$(IMAGE):$(TAG)

push: build
	docker push $(ACCOUNT)/$(IMAGE):$(TAG)

create:
	kubectl --context=pi-k8s create -f k8s/pi-k8s.yaml

update:
	kubectl --context=pi-k8s replace -f k8s/pi-k8s.yaml

delete:
	kubectl --context=pi-k8s delete -f k8s/pi-k8s.yaml

create-dev:
	kubectl --context=minikube create -f k8s/minikube.yaml

update-dev:
	kubectl --context=minikube replace -f k8s/minikube.yaml

delete-dev:
	kubectl --context=minikube delete -f k8s/minikube.yaml
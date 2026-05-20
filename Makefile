IMAGE_NAME ?= docker.madgik.di.uoa.gr/eosc-node-endpoint-ui
IMAGE_TAG ?= $(shell node -p "require('./package.json').version" 2>/dev/null || echo latest)
DOCKER_IMAGE := $(IMAGE_NAME):$(IMAGE_TAG)
COMPOSE_FILE ?= compose.yaml

.PHONY: install build run docker-build docker-push docker-compose docker-compose-down default

install:
	npm ci

build:
	npm run build:prod

run:
	@trap 'exit 0' INT; npm run start

docker-build:
	docker build -t $(DOCKER_IMAGE) .

docker-push:
	docker image push $(DOCKER_IMAGE)

docker-compose:
	IMAGE_NAME=$(DOCKER_IMAGE) docker compose -f $(COMPOSE_FILE) up --build

docker-compose-down:
	IMAGE_NAME=$(DOCKER_IMAGE) docker compose -f $(COMPOSE_FILE) down

default: docker-build docker-push

.DEFAULT_GOAL := default

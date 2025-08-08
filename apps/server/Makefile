SHELL := /usr/bin/env bash

.PHONY: dev up build logs down

dev:
	bun  src/index.ts

up:
	docker compose up

build:
	docker compose build

logs:
	docker compose logs -f --tail=100

down:
	docker compose down -v

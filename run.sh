#!/bin/sh

docker run --rm -ti -v $PWD:/app -w /app  node:21-slim $@

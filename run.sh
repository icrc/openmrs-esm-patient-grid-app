#!/bin/sh

docker run --rm -ti -v $PWD:/app -w /app  node:17-buster-slim $@

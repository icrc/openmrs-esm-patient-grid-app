#!/bin/sh

docker run --rm -ti -v $PWD:/app -w /app  node:18-buster-slim $@

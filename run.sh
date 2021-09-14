#!/bin/sh

if [ -z "$SECRET_ENV_FILE" ]; then
    echo "ERROR: MISSING ENV VAR: SECRET_ENV_FILE:"
    echo "Must contain a path to a file containing secrets to load as env vars."
    exit 1
else
    source ${SECRET_ENV_FILE}
    node ./build/index.js "$@"
fi

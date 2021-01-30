#!/bin/sh

if [ -z "$SECRET_ENV_FILE" ]; then
    echo "ERROR: MISSING ENV VAR: SECRET_ENV_FILE:"
    echo "Must contain a path to a file containing secrets to load as env vars."
    exit 1
else
    echo '0 18 * * * source ${SECRET_ENV_FILE} && node /app/build/index.js '"$@"' > /proc/1/fd/1 2>/proc/1/fd/2' >> /etc/crontabs/root
    source ${SECRET_ENV_FILE}
    crond -f 
    # node ./build/index.js "$@"
fi

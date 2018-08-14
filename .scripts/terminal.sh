#!/usr/bin/env bash
docker run --rm -it --env-file .env.local -v $(pwd):/usr/src/app -p 3000:3000 erp /bin/bash
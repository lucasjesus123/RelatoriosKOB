#!/usr/bin/env bash
set -euo pipefail

: "${VPS_TARGET:?VPS_TARGET não definido}"

cd "$VPS_TARGET"
docker compose up -d --build
docker image prune -f

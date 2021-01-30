#!/usr/bin/env sh

# tag=$(printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)")
tag=latest

docker build \
       -t "registry.personal.remolueoend.xyz/signal-backup:$tag" .

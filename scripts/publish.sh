#!/bin/bash

REMOTE_VERSION=$(npm info tscgen version)
LOCAL_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

if [[ $REMOTE_VERSION == $LOCAL_VERSION ]] ; then
  echo "Already latest version!"
else
  npm publish
fi

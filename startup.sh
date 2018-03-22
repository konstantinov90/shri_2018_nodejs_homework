#!/bin/sh
echo express.port=$PORT > app.properties
echo repository.directory=/target >> app.properties
git clone $TARGET_REPO /target
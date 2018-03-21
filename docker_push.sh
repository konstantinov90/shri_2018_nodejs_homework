#!/bin/bash
# docker build --no-cache --tag konstantinov90/shri_2018_nodejs_homework .
docker build --no-cache --tag registry.heroku.com/shri-2018-nodejs-homework/web .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD";
docker push registry.heroku.com/shri-2018-nodejs-homework/web
# docker push konstantinov90/shri_2018_nodejs_homework

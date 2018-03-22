#!/bin/bash
# docker build --no-cache --tag konstantinov90/shri_2018_nodejs_homework .
docker build --no-cache --tag registry.heroku.com/shri-2018-nodejs-homework-stag/web .
docker login --username=_ --password=$(heroku auth:token) registry.heroku.com
docker push registry.heroku.com/shri-2018-nodejs-homework-stag/web
# docker push konstantinov90/shri_2018_nodejs_homework

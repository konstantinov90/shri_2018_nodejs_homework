#!/bin/bash
docker build --no-cache --tag konstantinov90/shri_2018_nodejs_homework .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD";
docker push konstantinov90/shri_2018_nodejs_homework

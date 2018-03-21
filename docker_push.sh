#!/bin/bash
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD";
docker push konstantinov90/shri_2018_nodejs_homework

#!/bin/bash

echo "==========================================="
echo "= TO RUN THIS SCRIPT YOU MUST HAVE DOCKER ="
echo "=      RUNNING IN EXPERIMENTAL MODE       ="
echo "=           IT IS PRETTY EASY             ="
echo "==========================================="

echo ""
echo "https://stackoverflow.com/questions/44346322/how-to-run-docker-with-experimental-functions-on-ubuntu-16-04"
echo ""

# Build the image
docker build -t sifnode-ui-stack --file ./chains/chains.Dockerfile ..

# Run the image and concurrently wait for the webserver to connect (means state is ready)
docker run -p 1317:1317 \
  -p 7545:7545 \
  -p 5000:5000 \
  -p 26656:26656 \
  -p 26657:26657 --name sifui sifnode-ui-stack&

yarn wait-on http-get://localhost:5000 && sleep 20 && docker checkpoint create  --leave-running=false sifui launchchain
# Create a checkpoint and name it

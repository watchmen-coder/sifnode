#!/bin/bash

# Build the image
podman build -t sifnode-ui-stack --file ./chains/chains.Dockerfile ..

# Run the image and concurrently wait for the webserver to connect (means state is ready)
podman run -p 1317:1317 \
  -p 7545:7545 \
  -p 5000:5000 \
  -p 26656:26656 \
  -p 26657:26657 --name sifui sifnode-ui-stack

# yarn wait-on http-get://localhost:5000 && sleep 20 && podman container checkpoint sifui mypoint
# Create a checkpoint and name it

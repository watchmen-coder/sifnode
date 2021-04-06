#!/bin/bash

# Build the image
docker build --file ./chains/chains.Dockerfile ..

# Run the image and concurrently wait for the webserver to connect (means state is ready)

# Create a checkpoint and name it


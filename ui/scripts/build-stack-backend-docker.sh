#!/bin/bash


# this is temporarily being published on rudis docker hub account - @ryarfley
# TODO: investigate publishing on sifchain repository (possibly GH repo)
cd .. && docker build -f ./ui/scripts/stack.Dockerfile -t ryardley/sifdevstack01:42attempt .
docker push ryardley/sifdevstack01:42attempt
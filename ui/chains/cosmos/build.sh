#!/usr/bin/env bash

if command -v killall &> /dev/null
then
  killall sifnoded sifnodecli
fi


rm $(which sifnoded) 2> /dev/null || echo sifnoded not install yet ...
rm $(which sifnodecli) 2> /dev/null || echo sifnodecli not install yet ...

rm -rf ~/.sifnoded
rm -rf ~/.sifnodecli

cd ../../../ && make install 
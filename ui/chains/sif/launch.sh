#!/usr/bin/env bash

. ../credentials.sh

rm -rf ~/.sifnoded
# srm -rf ~/.sifnoded

sifnoded init test --chain-id=sifchain-local --log_level error
cp ./config.toml ~/.sifnoded/config

# sifnoded config output json
# sifnoded config indent true
# sifnoded config trust-node true
# sifnoded config chain-id sifchain-local
# sifnoded config keyring-backend test

echo "Generating deterministic account - ${SHADOWFIEND_NAME}"
echo "${SHADOWFIEND_MNEMONIC}" | sifnoded keys add ${SHADOWFIEND_NAME} --recover 

echo "Generating deterministic account - ${AKASHA_NAME}"
echo "${AKASHA_MNEMONIC}" | sifnoded keys add ${AKASHA_NAME} --recover 

echo "Generating deterministic account - ${JUNIPER_NAME}"
echo "${JUNIPER_MNEMONIC}" | sifnoded keys add ${JUNIPER_NAME} --recover 

sifnoded add-genesis-account $(sifnoded keys show ${SHADOWFIEND_NAME} -a --log_level error) 100000000000000000000000000000rowan,100000000000000000000000000000catk,100000000000000000000000000000cbtk,100000000000000000000000000000ceth,100000000000000000000000000000cusdc,100000000000000000000000000000clink,100000000000000000000000000stake --log_level error
sifnoded add-genesis-account $(sifnoded keys show ${AKASHA_NAME} -a --log_level error) 100000000000000000000000000000rowan,100000000000000000000000000000catk,100000000000000000000000000000cbtk,100000000000000000000000000000ceth,100000000000000000000000000000cusdc,100000000000000000000000000000clink,100000000000000000000000000stake --log_level error
sifnoded add-genesis-account $(sifnoded keys show ${JUNIPER_NAME} -a --log_level error) 10000000000000000000000rowan,10000000000000000000000cusdc,100000000000000000000clink,100000000000000000000ceth --log_level error

sifnoded add-genesis-validators $(sifnoded keys show ${SHADOWFIEND_NAME} -a --bech val --log_level error) --log_level error

sifnoded gentx --name ${SHADOWFIEND_NAME} --amount 1000000000000000000000000stake --keyring-backend test --log_level error

echo "Collecting genesis txs..."
sifnoded collect-gentxs --log_level error

echo "Validating genesis file..."
sifnoded validate-genesis --log_level error

./start.sh
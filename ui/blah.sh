# terminal window 1
VUE_APP_DEPLOYMENT_TAG=sandpit VUE_APP_ETHEREUM_ASSET_TAG=ethereum.ropsten VUE_APP_SIFCHAIN_ASSET_TAG=sifchain.sandpit yarn app:serve
# terminal window 2
VUE_APP_DEPLOYMENT_TAG=sandpit VUE_APP_ETHEREUM_ASSET_TAG=ethereum.ropsten VUE_APP_SIFCHAIN_ASSET_TAG=sifchain.sandpit yarn core:watch

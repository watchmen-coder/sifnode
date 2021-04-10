killall ebrelayer
vagrant snapshot restore testsnap
yarn chain:peggy &>/dev/null&
echo "ebrelayer running in the background"
This doc is out of date... yes we should just use vagrant

# Instant Stack Spike

So there is a massive problem with our DX due to how long the blockchains take to startup as we need to commission liquidity pools and whitelist tokens. I went on a spike in an attempt to try and get us a deterministic testing environment as if I was right we could increase productivity by a huge amount as it is really slow working with the backing services and I was thinking this might not be too hard. (I was wrong). Here I want to share what I worked out.

- checkpoint/restore needs a criu package which is not available on mac so I used vagrant
- Docker can't really do checkpoint/restore yet so I used podman
- Fedora is the best distro for this as it comes with criu and designed to work with podman
- Despite it being years ago that this stuff was put together criu might be buggy for complex processes and this thing might not really work at all.
- I am over my head and I need to throw in the towel

# Start Vagrant

1. Ensure vagrant is setup

Start vagrant from the `ui` folder using the given `Vagrantfile`

```
vagrant up
```

```
vagrant ssh
```

# Build the image (takes time)

I have put this dockerfile together to try and run both chains within a container in order to then restart them with preexisting state. ebrelayer starts quickly so it doesn't need to be included.

Run this from `./ui`

```
sudo podman build -t sifnode-ui-stack --file ./chains/chains.Dockerfile ..
```

# Run the image and concurrently wait for the webserver to connect (means state is ready)

```
cid=$(sudo podman run \
  -p 1317:1317 \
  -p 7545:7545 \
  -p 5000:5000 \
  -p 26656:26656 \
  -p 26657:26657 \
  -d \
  sifnode-ui-stack)
```

Tail the logs if you want

```
sudo podman logs -f $cid
```

This also serves a file with a simple server to show that it is ready (http://localhost:5000)

Curling the node_info works:

```
curl http://localhost:1317/node_info
```

You can now run the frontend against the nodes Eg.:

```
yarn app:serve
```

All we need to do now is hibernate the container and restore...

# Create a checkpoint and save it to a file

I try and save a checkpoint to a file

```
sudo podman container checkpoint -e /tmp/stack $cid --tcp-established
```

# Restoring the checkpoint doesn't seem to work

Need to delete the container otherwise the restoration fails because it has the same ID... ok

```
sudo podman rm $cid
```

Then restore the container from the file

```
sudo podman container restore -i /tmp/stack --tcp-established
```

This seems to work and when I curl the simple ready server (`curl http://localhost:5000`) it returns a value (possibly cached) but logs just stop from here and getting node_info refuses connection:

```
curl http://localhost:1317/node_info
```

# Can you help solve the mystery of why we can't restore the container?

- Is this the wrong approach?
- Should we just snapshot vagrant? DID AN EXPERIMENT AND YES WE SHOULD JUST USE VAGRANT

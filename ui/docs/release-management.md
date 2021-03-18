# What does a breaking API change look like? 

## Option 1 - Backend API versioning

Normal backend breaking change release for standard web apps

| be:master | fe:master |
| --------- | --------- |
| v1        | v1        |
| v1 + v2   | v1        |
| v1 + v2   | v2        |
| v2        | v2        |

This is certainly the most simple way we can support future breaking changes. We should definitely do this if this is possible.

normally versioning rest services looks like this:

`http://someserver/v1/clp/getPools`

Then if a service has breaking changes you might put it under a new verion but support both versions

`http://someserver/v2/clp/getPools`

---

## Option 2 - Frontend client versioning - Not recommended

There might be issues with supporting multiple API versions

We could take an approach where the frontend detects the backend and supports multiple services via a strategy pattern but this is WAY more complex on the frontend. Possible but way more complex.

| be:master | fe:master |
| --------- | --------- |
| v1        | v1        |
| v1        | v1 + v2   |
| v2        | v1 + v2   |
| v2        | v2        |

The way ths would work would be like so:

1. Frontend loads
1. Frontend asks backend server for a deployment version number ideally in `node_info`
1. If the deployment number is higher than a certain version the appropriate strategy is injected as the app is built
1. If the deployment is higher than the current version the frontend has been designed to track it shows a message to the user saying that this frontend is out of date and it tries to reload after a few seconds.

# UX - Consistency is more important than availability here

## What happens when the frontend is run against a newer backend

- Show a full page warning that the interface is not designed to support the backend
- Refresh every few seconds incase we are mid deployment - pass a query string with the number of refreshes and if there have been X refreshes stop refreshing

## What happens when the frontend is run against an older backend

- Show a full page warning that the interface is not designed to support the backend - "updating..."
- Refresh every few seconds incase we are mid deployment - pass a query string with the number of refreshes and if there have been X refreshes stop refreshing

# Testing

We can avoid contract testing by maintaining integration tests against supported version.

1. Frontend built with hard coded git commit
1. Integration test checks out backend repo with git commit and builds backend binary (once docker image is ready we should be able to get image versions tagged by git commit.)
1. Frontend integration tests are run against this binary (or docker build)

# Status information API

This is an API that provides and updates information about the statuses of the matters.

## Requirements

### Docker requirements

If using docker compose, the following network must be created: `vfd-network`.

Create the network with the following command:

```
docker network create vfd-network
```

## Usage

```
docker compose up
```

## API Documentation:

Once the docker container is running, you can access the API documentation at:

- http://localhost:5747/docs

## References

- https://github.com/nklisch/express-openapi-generator

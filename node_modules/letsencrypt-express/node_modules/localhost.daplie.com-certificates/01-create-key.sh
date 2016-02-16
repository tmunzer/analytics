#!/bin/bash

mkdir -p certs/server
openssl genrsa \
  -out certs/server/my-server.key.pem \
  2048

#!/bin/bash

cat \
  ./certs/server/my-server.crt.pem \
  ./certs/ca/intermediate.crt.pem \
  ./certs/ca/root.crt.pem \
  > ./certs/bundle.pem

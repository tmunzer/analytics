#!/bin/sh
cd /app
npm install
bower install --allow-root
cd /app/bin
if [ "$1" ]
then
    PORT=$1 node ./www
else
    PORT=51360 node ./www
fi

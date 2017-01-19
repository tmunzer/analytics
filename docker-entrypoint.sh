cd /app/bin
if [ "$1" ]
then
    PORT=$1 node ./www
else
    PORT=51365 node ./www
fi
FROM node:6-wheezy
MAINTAINER Thomas Munzer <tmunzer@aerohive.com>
LABEL fr.ah-lab.analytics.version="0.0.2"
LABEL fr.ah-lab.analytics.release-date="2017-02-10"

RUN apt-get update \
    && apt-get install -y git \
    && apt-get clean

RUN npm install -g bower

RUN git clone https://github.com/tmunzer/analytics.git /tmp/app/
RUN cp -r /tmp/app /app && \
    rm -rf /tmp/app/ && \
    chmod a+x /app/docker-entrypoint.sh

WORKDIR /app
RUN npm install
RUN bower install --allow-root

EXPOSE 51362
ENTRYPOINT /app/docker-entrypoint.sh 51362

FROM alpine:3.22.1

RUN apk add nodejs
RUN apk add autoconf automake gcc g++ libtool

RUN mkdir /opt/chattybot
WORKDIR /opt/chattybot
COPY ../../../ ./

ENTRYPOINT ["/usr/bin/npm", "start"]
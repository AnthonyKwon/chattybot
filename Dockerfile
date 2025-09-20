FROM alpine:3.22.1

RUN apk add nodejs npm
RUN apk add autoconf automake gcc g++ libtool make python3

RUN mkdir /opt/app
WORKDIR /opt/app
COPY ./ ./

RUN npm install && npm run build
RUN apk del autoconf automake gcc g++ libtool make python3
RUN rm -r /opt/app/src /opt/app/global.d.ts /opt/app/tsconfig.json

ENTRYPOINT ["/usr/bin/npm", "start"]

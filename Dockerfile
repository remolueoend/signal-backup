#
# build stage
#
FROM alpine:3.13 as build-stage
RUN apk add yarn cargo openssl openssl-dev sqlite sqlite-dev git python2 make g++

WORKDIR /app/
COPY signal-backup-decode signal-backup-decode
COPY package.json yarn.lock ./
RUN yarn build.deps

RUN yarn install

COPY tsconfig.json esbuild.js ./
ADD src src
RUN yarn build

RUN rm -rf node_modules && yarn install --prod && yarn cache clean

#
# production stage
# all previous layers won't be part of the image.
# Install and copy only runtime-essential tools and assets
#
FROM alpine:3.13 as production-stage
# no yarn required, nodejs is enough:
RUN apk add --no-cache nodejs
RUN apk add sqlite-dev
WORKDIR /app

# Copy build assets from previous stage:
COPY --from=build-stage ./app/node_modules node_modules
COPY --from=build-stage ./app/build build
COPY run.sh run.sh

ENV NODE_ENV=production

ENTRYPOINT ["./run.sh"]

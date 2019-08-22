FROM node:lts-alpine
WORKDIR /repo
COPY package.json yarn.lock ./
RUN yarn install
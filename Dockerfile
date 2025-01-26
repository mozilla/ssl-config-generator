FROM node:alpine

WORKDIR /app

COPY package*.json ./
COPY . ./

RUN apk add --no-cache git && \
    npm install

ENTRYPOINT ["npm", "run", "watch"]

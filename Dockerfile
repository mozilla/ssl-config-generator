FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./
COPY . ./

RUN npm install

ENTRYPOINT ["npm", "run", "watch"]

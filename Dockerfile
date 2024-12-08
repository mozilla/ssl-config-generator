FROM node:22

WORKDIR /app

COPY package*.json ./
COPY config/ ./
COPY src/ ./
COPY . ./

RUN npm install copy-webpack-plugin --save-dev && \
    npm install -g webpack webpack-cli && \
    npm run build

ENTRYPOINT ["npm", "run", "watch"]

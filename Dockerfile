FROM node:20

WORKDIR /client

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 16000

CMD [ "npx", "serve", "./dist", "-p", "16000" ]
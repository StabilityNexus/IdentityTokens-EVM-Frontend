FROM node:22-alpine

WORKDIR /usr/src/app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY . .

RUN npm i

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
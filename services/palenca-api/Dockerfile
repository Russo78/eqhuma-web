# Etapa 1: Build
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Etapa 2: Imagen final
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app ./

ENV NODE_ENV=production
EXPOSE 5004

CMD [ "node", "server.js" ]

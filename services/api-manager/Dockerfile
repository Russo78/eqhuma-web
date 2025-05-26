FROM node:18-alpine

ENV ENABLE_API_DOCS=true
ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]

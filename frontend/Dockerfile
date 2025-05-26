# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build  # 'next build' ya hace la exportación estática si tienes output: 'export' en next.config.js

# Etapa 2: Servir con NGINX
FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

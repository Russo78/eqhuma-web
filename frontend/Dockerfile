# Etapa de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar package.json y lock
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Build del proyecto
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production
COPY --from=builder /app/out /usr/share/nginx/html

# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar solo archivos clave primero para mejorar caché
COPY package.json package-lock.json ./
COPY tsconfig.json ./     # 👈 este es el archivo necesario para los alias @
COPY . .

RUN npm install && npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

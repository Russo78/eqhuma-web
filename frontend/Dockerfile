# Etapa 1: build con Bun
FROM oven/bun:1.1.13 as builder

WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

# Etapa 2: nginx para servir estático (solo si usas `next export`)
FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

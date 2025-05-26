# Usa una imagen base liviana de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . .

# Instala las dependencias
RUN npm install

# Expón el puerto si aplica (opcional, ejemplo puerto 3000)
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]

# services/apimarket-api/Dockerfile

FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]
EXPOSE 3000
# Build the Docker image with the command:  docker build -t apimarket-api .
# Run the Docker container with the command: docker run -p 3000:3000 apimarket-api          
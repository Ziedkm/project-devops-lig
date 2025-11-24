# Stage 1: Build
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# DEBUG: Check if .env file was copied
RUN ls -la .env || echo ".env file NOT FOUND in Docker"
RUN cat .env || echo "Cannot read .env"
RUN npm run build


# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

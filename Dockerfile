# Stage 1: Build
FROM node:20-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source including .env.production created by Jenkins
COPY . .

# Debug: ensure env file exists
RUN ls -la .env.production || echo "NO .env.production FOUND"

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

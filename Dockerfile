FROM node:20-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# DEBUG: Check if .env.production exists and show its content
RUN ls -la .env.production || echo "FILE NOT FOUND"
RUN cat .env.production || echo "CANNOT READ FILE"

# CRITICAL FIX: Convert Windows line endings to Unix (CRLF -> LF)
RUN apk add --no-cache dos2unix
RUN dos2unix .env.production 2>/dev/null || true

# Show the file again after conversion
RUN echo "=== After dos2unix ===" && cat .env.production

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

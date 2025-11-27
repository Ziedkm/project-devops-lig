FROM node:20-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# CRITICAL FIX: Remove .env.local so .env.production takes effect
RUN rm -f .env.local .env

# Now create .env.production (it will be the only .env file)
# (The file is already copied from Jenkins workspace, but let's verify)
RUN ls -la .env* || echo "No .env files"
RUN cat .env.production

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Frontend -- built to static files, served by nginx.
# Multi-stage: Node only needed to build; the final image is just nginx
# serving pre-built static assets, which is smaller and has no JS runtime
# attack surface in production.

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

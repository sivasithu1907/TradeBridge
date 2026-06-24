# Backend API — Node 22, production dependencies only.
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (separate layer so `npm install` is cached
# unless package.json actually changes — faster rebuilds during deploys).
COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

# Uploaded documents live here. Mounted as a volume in docker-compose so
# they survive container restarts/rebuilds — see docker-compose.yml.
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "src/server.js"]

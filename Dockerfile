# Stage 1: prod-only dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci --omit=dev

# Stage 2: build shared + server
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci
COPY shared/ ./shared/
COPY server/ ./server/
RUN npm run build -w server

# Stage 3: runtime
FROM node:22-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "dist/index.js"]

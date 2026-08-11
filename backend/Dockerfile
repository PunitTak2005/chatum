# Node.js Alpine base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Expose port
EXPOSE 9001

ENV NODE_ENV=production
ENV PORT=9001

CMD ["npm", "start"]

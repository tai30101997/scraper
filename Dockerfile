# --- Stage 1: Builder ---
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
  python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps
COPY . .
ARG APP_NAME
RUN npx nx build ${APP_NAME} --prod


FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333
ARG APP_NAME

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/${APP_NAME}/. ./

RUN ls -la /app
RUN mkdir -p /app/data

EXPOSE 3333
CMD ["node", "main.js"]
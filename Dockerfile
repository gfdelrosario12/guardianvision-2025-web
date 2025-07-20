# Stage 1: Build
FROM node:20-slim AS build

WORKDIR /app

COPY .env.production .env.production
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Run
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]

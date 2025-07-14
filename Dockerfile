# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .

# Accept and expose environment variables for build-time
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_S3_BUCKET

ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_S3_BUCKET=$NEXT_PUBLIC_S3_BUCKET

RUN npm install
RUN npm run build

# Run stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

# Ensure runtime access (optional if not using SSR)
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_S3_BUCKET=$NEXT_PUBLIC_S3_BUCKET
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]

# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client after code is copied
RUN npx prisma generate

# Build only for production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi


# Stage 2: Production image
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Only copy compiled dist/ in production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=builder /app/dist ./dist
COPY .env .env

# Re-run Prisma generate here
RUN npx prisma generate

CMD ["node", "dist/main"]


# Stage 3: Development image
FROM node:18-alpine AS development

WORKDIR /app

COPY --from=builder /app ./
COPY .env .env

# Override CMD for development with hot-reload
CMD ["npm", "run", "start:dev"]


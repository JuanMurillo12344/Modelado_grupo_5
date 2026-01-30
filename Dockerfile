# Dockerfile básico para Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile || pnpm install --frozen-lockfile
RUN npm run build || yarn build || pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]

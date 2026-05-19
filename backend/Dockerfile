FROM node:20-alpine

# OpenSSL requis par Prisma sur Alpine (musl)
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["sh", "entrypoint.sh"]

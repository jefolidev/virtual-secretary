FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

# Copia a pasta prisma ANTES de rodar o generate
COPY prisma ./prisma/

RUN bun prisma migrate deploy
RUN bun prisma generate

COPY . .
RUN bun run build

EXPOSE 3333
CMD ["bun", "run", "start:prod"]

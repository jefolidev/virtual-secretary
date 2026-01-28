FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

# 1. Copia o código (incluindo o prisma.config.ts)
COPY . .

# 2. Gera o client injetando uma URL fake para o validador do Prisma 7 não reclamar
RUN DATABASE_URL="postgresql://fake:fake@localhost:5432/fake" bun prisma generate

# 3. Compila o NestJS
RUN bun run build

EXPOSE 3000

CMD ["sh", "-c", "bun dist/src/infra/main.js"]
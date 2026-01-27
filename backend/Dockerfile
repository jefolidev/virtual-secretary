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

EXPOSE 3333

# 4. No comando de START, o Easypanel usará a URL real do banco
CMD bun x prisma migrate deploy && bun run start:prod
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

# NOVIDADE: Copia os arquivos gerados pelo Prisma para dentro da pasta dist 
# para que o código compilado os encontre no mesmo caminho relativo
RUN cp -r src/generated dist/src/

EXPOSE 3333

CMD ["sh", "-c", "bun x prisma migrate deploy && bun run start:prod"]
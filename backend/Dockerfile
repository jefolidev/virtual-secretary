FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

# 1. Copia o código primeiro (para o prisma.config.ts estar lá)
COPY . .

# 2. Gera o client ignorando a falta do banco
# A variável DATABASE_URL fake no config.ts vai permitir que isso passe
RUN bun prisma generate

# 3. Compila o NestJS
RUN bun run build

EXPOSE 3333

# 4. Aqui o Easypanel injeta a URL real e o deploy funciona
CMD bun x prisma migrate deploy && bun run start:prod
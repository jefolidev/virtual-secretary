FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

# 1. Copia TUDO primeiro
COPY . .

# 2. Garante que a pasta prisma e o schema estão lá e gera o client
# Como o output é ../src/generated/prisma, ele vai criar a pasta dentro de src
RUN bun prisma generate

# 3. Agora o build vai encontrar os arquivos
RUN bun run build

EXPOSE 3333

# Migrations no start
CMD bun x prisma migrate deploy && bun run start:prod
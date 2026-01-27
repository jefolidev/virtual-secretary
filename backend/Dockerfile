FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY prisma ./prisma/
# Gera apenas os tipos (Prisma Client)
RUN bun prisma generate

COPY . .
# Compila o NestJS
RUN bun run build

EXPOSE 3333

# Roda as migrations no START (Runtime) usando o comando 'deploy'
CMD bun x prisma migrate deploy && bun run start:prod
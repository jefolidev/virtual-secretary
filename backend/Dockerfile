FROM oven/bun:1-alpine

WORKDIR /app

# 1. Instalação das dependências
COPY package.json bun.lock* ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile
RUN bun x prisma generate

# 2. Copia todo o código
COPY . .
RUN bun run build

# 3. Build do NestJS

# 5. Verificação de segurança (isso aparecerá nos logs do Easypanel)
# RUN ls -R dist

EXPOSE 3000

# 6. Inicia o servidor usando o caminho correto do entryFile
CMD ["bun", "run", "start:prod"]
FROM oven/bun:1-alpine

WORKDIR /app

# 1. Instalação das dependências
COPY package.json bun.lock* ./
RUN bun install

# 2. Copia todo o código
COPY . .

# 3. Gera o Prisma Client (necessário antes do build por causa dos tipos)
RUN bun x prisma generate

# 4. Build do NestJS
RUN bun run build

# 5. Verificação de segurança (isso aparecerá nos logs do Easypanel)
RUN ls -R dist/infra

EXPOSE 3000

# 6. Inicia o servidor usando o caminho correto do entryFile
CMD ["bun", "run", "start:prod"]
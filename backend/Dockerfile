# Usa a imagem oficial do Bun (leve e rápida)
FROM oven/bun:1-alpine

# Define o diretório de trabalho dentro da pasta /backend que configuraste
WORKDIR /app

# Copia os ficheiros de dependências primeiro para aproveitar o cache
COPY package.json bun.lock ./

# Instala as dependências usando o motor do Bun
RUN bun install

# Copia o resto do código (src, prisma, etc)
COPY . .

# Executa o build do NestJS (certifica-te que tens o script "build" no package.json)
RUN bun run build

# Expõe a porta que o teu NestJS usa
EXPOSE 3000

# Comando para iniciar a aplicação em produção
CMD ["bun", "run", "start:prod"]
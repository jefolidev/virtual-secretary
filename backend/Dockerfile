FROM node:20-alpine

WORKDIR /app

# 1. Copia arquivos de dependência
COPY package*.json ./

# 2. Instala TUDO (necessário para o build)
RUN npm install

# 3. Copia o código fonte
COPY . .

# 4. Gera a pasta /dist
RUN npm run build

# 5. (Opcional) Limpa as devDependencies para o container ficar leve
RUN npm prune --production

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
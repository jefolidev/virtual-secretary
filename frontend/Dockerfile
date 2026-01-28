# Estágio 1: Instalação e Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json bun.lock ./

# Instala as dependências usando o Bun
RUN bun install --frozen-lockfile

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build (ajuste o comando conforme seu package.json: 'build' ou 'build:prod')
RUN bun run build

# Estágio 2: Servidor de produção (Nginx)
FROM nginx:stable-alpine

# Copia o build do estágio anterior para a pasta do Nginx
# Se você usa VITE, a pasta costuma ser 'dist'. Se for React puro, 'build'.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do Nginx para suportar React Router/SPA
# (Opcional, mas recomendado para evitar erro 404 ao dar refresh em rotas)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
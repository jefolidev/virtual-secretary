# Estágio 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# 1. Declarar argumentos de build (O EasyPanel injeta as envs aqui durante o build)
ARG VITE_BACKEND_API_URL
ARG VITE_ENVIRONMENT

# 2. Tornar as variáveis disponíveis para o processo do Vite
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# 3. Instalar dependências
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# 4. Copiar o código e gerar o build
COPY . .
RUN bun run build

# ---

# Estágio 2: Produção (Servidor Estático)
FROM nginx:stable-alpine

# 5. Copiar os arquivos compilados (Vite gera na pasta 'dist')
COPY --from=builder /app/dist /usr/share/nginx/html

# 6. Configuração customizada do Nginx para suportar React Router (SPAs)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
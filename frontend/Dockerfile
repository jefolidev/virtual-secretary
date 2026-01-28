# Estágio 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# --- INJEÇÃO DE VARIÁVEIS DO EASYPANEL ---
# O EasyPanel passa as 'env' como argumentos de build automaticamente
ARG VITE_BACKEND_API_URL
ARG VITE_ENVIRONMENT

# Definimos como variáveis de ambiente para que o processo do Vite as encontre
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
# -----------------------------------------

# Copia arquivos de dependências
COPY package.json bun.lockb ./

# Instala as dependências (frozen-lockfile garante que a versão seja a mesma do seu local)
RUN bun install --frozen-lockfile

# Copia o restante do código
COPY . .

# Executa o build (aqui as variáveis são gravadas nos arquivos .js)
RUN bun run build

# --- Estágio 2: Servidor ---
FROM nginx:stable-alpine

# Copia os arquivos compilados (pasta 'dist' gerada pelo Vite)
COPY --from=builder /app/dist /usr/share/nginx/html

# Configura o Nginx para redirecionar rotas para o index.html (evita 404 no refresh)
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
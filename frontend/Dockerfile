FROM oven/bun:latest AS builder
WORKDIR /app

# O EasyPanel injeta as variáveis do campo 'env' como ARGs de build automaticamente
ARG VITE_BACKEND_API_URL
ARG VITE_ENVIRONMENT

# Repassa para o ambiente do Bun para o 'Vite' enxergar
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .

# O build do Vite 'queima' as variáveis no JS final aqui
RUN bun run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# ... sua config do nginx para SPA ...
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
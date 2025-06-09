# Etapa 1: build
FROM node:20 AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# Copia o restante da aplicação e executa o build
COPY . .
RUN npm run build

# Etapa 2: servidor web para servir os arquivos estáticos
FROM nginx:alpine

# Remove a configuração padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos de build para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

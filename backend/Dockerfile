# Etapa 1: Build do Prisma Client Go
FROM golang:1.22 AS prisma-build

# Instala Node.js e npm no Debian
RUN apt-get update && apt-get install -y nodejs npm

WORKDIR /app

# Copia os arquivos necessários
COPY go.mod go.sum ./
COPY package.json ./
COPY prisma ./prisma
COPY prisma/schema.prisma ./prisma/

# Instala Prisma e gera o client
RUN npm install prisma --save-dev
RUN go install github.com/steebchen/prisma-client-go@v0.47.0

RUN npx prisma generate --schema=prisma/schema.prisma

# Etapa 2: Container final de execução
FROM golang:1.22 AS backend

# Instala dependências para runtime
RUN apt-get update && apt-get install -y nodejs npm curl bash

WORKDIR /app

# Copia os arquivos da etapa de build
COPY --from=prisma-build /app/go.mod /app/go.mod
COPY --from=prisma-build /app/go.sum /app/go.sum
COPY --from=prisma-build /app/package.json /app/package.json
COPY --from=prisma-build /app/prisma /app/prisma
COPY --from=prisma-build /app/prisma/prisma-client /app/prisma/prisma-client

# Baixa dependências do Go
RUN go mod download

# Copia o restante da aplicação
COPY . .

# Ajusta dependências finais
RUN go mod tidy

# Entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
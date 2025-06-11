# Conversion Tracker

![License](https://img.shields.io/badge/license-MIT-green)

> Projeto desenvolvido para o desafio Tech Lead da Ilumeo.

## Sobre

Análise temporal de taxa de conversão por origem a partir de grandes volumes de dados.

## Tecnologias Utilizadas

* **Backend:** Golang + Prisma + GIN
* **Frontend:** React + TypeScript + Vite
* **Banco de Dados:** PostgreSQL
* **Containerização:** Docker

---

## Rodando localmente

```bash
https://github.com/hugolond/caseilumeo.git
cd caseilumeo
docker-compose up --build
```

Acesse os serviços:

* Frontend: [http://localhost:3000](http://localhost:3000)
* API: [http://localhost:8080/inside/conversion/](http://localhost:8080/inside/conversion/)

Crie um arquivo `.env` secrets

---

## Funcionalidades

* Evolução da taxa de conversão por canal
* Filtros por data e canal
* Gráficos interativos no dashboard

---
## Especificação da API

### `GET /inside/conversion/{origin}?start=yyyy-mm-dd&end=yyyy-mm-dd`

**Parâmetros:**

| Nome      | Tipo   | Descrição                          |
| --------- | ------ | ---------------------------------- |
| origin    | String | Canal: `email`, `wpp`, etc.        |
| start     | Date   | Data inicial do período            |
| end       | Date   | Data final do período              |


**Resposta:**

```json
[
  {
    "date": "2025-05-01",
    "channel": "email",
    "conversion_rate": 0.2123,
    "total": 1000, 
    "converted" : 213
  }
]
```

## Dockerização

Todos os serviços estão orquestrados via Docker Compose:

```yaml
ervices:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: *******
      POSTGRES_PASSWORD: *******
      POSTGRES_DB: *******
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://*******:******@db:5432/postgres
    volumes:
      - ./backend:/app
    command: ["air"]
    ports:
      - "8080:8080"
    depends_on:
      - db
    deploy:
      resources:
        limits:
          memory: 512M  

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    deploy:
      resources:
        limits:
          memory: 512M
volumes:
  pgdata:
```

---

## Deploy produção

* Frontend hospedado em Render : [https://ilumeo-frontend.onrender.com](https://ilumeo-frontend.onrender.com)


# PI2
Projeto feito durante a matéria de Projeto Integrador 2 

---

##  Iniciando o Projeto
| Etapa | Comando | O que faz? |
| :--- | :--- | :--- |
| **1. Subir o projeto pela primeira vez** | `docker compose up -d --build` | Usado apenas na primeira vez(ou se houve mudanças nos arquivos do docker). |
| **2. Subir o projeto** | `docker compose up -d` | Sobe o projeto, iniciando tanto o Laravel como o  React. |
| **3. Parar o projeto** | `docker compose stop` | Para o projeto. |

---

##  Acessar
| Serviço / Framework | Endereço | Observações |
| :--- | :--- | :--- |
| `React` | "http://localhost:5173" | Frontend |
| `Laravel` | "http://localhost:8000" | API Backend |
| `pgAdmin 4` | "http://localhost:8081" | Login: `admin@admin.com` \| Senha: `admin` |
| `PostgreSQL` | `localhost:5432` | DB: `PI2` \| User: `postgres` \| Senha: `PI_password` |

---

##  Laravel
|Comando | O que faz? |
| :--- | :--- |
| `docker exec -it laravel_api php artisan migrate` | Faz as migrations |
| `docker exec -it laravel_api php artisan migrate:rollback` | Faz o rollback das migrations |

--- exemplo

##  React
|Comando | O que faz? |
| :--- | :--- |


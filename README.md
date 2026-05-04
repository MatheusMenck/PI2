# PI2
Projeto feito durante a matéria de Projeto Integrador 2 

---

##  Iniciando o Projeto
| Etapa | Comando | O que faz? |
| :--- | :--- | :--- |
| **1. Subir o projeto pela primeira vez** | `docker compose up -d --build` | Usado apenas na primeira vez(ou se hoube mudanças nos arquivos do docker). |
| **2. Subir o projeto** | `docker compose up -d` | Sobe o projeto, iniciando tanto o Laravel como o  React. |
| **3. Parar o projeto** | `docker compose stop` | Para o projeto. |

---

##  Acessar
|Framework | Endereço |
| :--- | :--- |
| `React` | "http://localhost:5173" |
| `Laravel` | "http://localhost:8000" |

---

##  Laravel
|Comando | O que faz? |
| :--- | :--- |
| `docker exec -it laravel_api php artisan migrate` | Faz as migrations |
| `ddocker exec -it laravel_api php artisan migrate:rollback` | Faz o rollback das migration |

---

##  React
|Comando | O que faz? |
| :--- | :--- |


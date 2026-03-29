# Projeto Backend

Backend de um sistema de e-commerce desenvolvido com Node.js, Express e Sequelize.

## 🚀 Tecnologias utilizadas

* Node.js
* Express
* Sequelize (ORM)
* PostgreSQL
* JWT (Autenticação)
* Bcrypt (Hash de senha)
* Jest + Supertest (Testes)

---

## 📦 Instalação

```bash
git clone https://github.com/MatheusVII/projeto-backend.git
cd projeto-backend
npm install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Gk4HOwch5lrS@ep-green-credit-acb2srx8-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=secreta
```

---

## ▶️ Rodando o projeto

```bash
npm run dev
```

---

## 🔄 Sincronizar banco

```bash
npm run sync
```

---

## 🧪 Testes

```bash
npm run tests
```

---

## 🔐 Autenticação

A API utiliza JWT.

Para rotas protegidas, envie no header:

```
Authorization: Bearer {token}
```

---

## 📌 Rotas principais

### 👤 Usuário

* GET `/v1/user/:id`
* POST `/v1/user`
* PUT `/v1/user/:id`
* DELETE `/v1/user/:id`

---

### 🏷️ Categoria

* GET `/v1/category/:id`
* GET `/v1/category/search`
* POST `/v1/category`
* PUT `/v1/category/:id`
* DELETE `/v1/category/:id`

---

### 📦 Produto

* GET `/v1/product/search`
* GET `/v1/product/:id`
* POST `/v1/product`
* PUT `/v1/product/:id`
* DELETE `/v1/product/:id`

---

## 🔎 Query Params (Product Search)

* `limit`
* `page`
* `match`
* `category_ids`
* `price-range`
* `option[id]=value`

---

## 📁 Estrutura do projeto

```
src/
 ├── config/
 │    ├── db.js
 │    └── syncDb.js
 │
 ├── models/
 │    ├── CategoryModel.js
 │    ├── ProductCategoryModel.js
 │    ├── ProductImage.js
 │    ├── ProductModel.js
 │    ├── ProductOptionModel.js
 │    ├── UserModel.js
 │    └── index.js
 │
 ├── controllers/
 │    └── (vazio)
 │
 ├── routes/
 │    ├── userRoutes.js
 │    ├── productRoutes.js
 │    └── categoryRoutes.js
 │
 ├── middlewares/
 │    └── authMiddleware.js
 │
 ├── app.js
 └── server.js
```

---

## 🧠 Funcionalidades

✔ Cadastro e autenticação de usuários
✔ CRUD de produtos
✔ CRUD de categorias
✔ Sistema de opções (cor, tamanho, etc)
✔ Filtro avançado de produtos
✔ Proteção com JWT

---

## 👨‍💻 Autor

Matheus Viana Ferreira Paz | matheusviana3038@gmail.com

---

## 📄 Licença

MIT

const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const productRoutes = require('./routes/productRoutes.js');

app.use('/v1', userRoutes);

app.use('/v1', categoryRoutes);

app.use('/v1', productRoutes);

app.get('/', (req, res) => {
    return res.json({message: "deu certo", endpoints: {
        User: {
            GET: {link:"http://localhost:3000/v1/user/3", message: "Pesquisa o usuario pelo ID"},
            POST: {link: "http://localhost:3000/v1/user", message: "Cria um novo usuario, rota de cadastro", defaultPayload: {
                    "firstname": "",
                    "surname": "",
                    "email": "",
                    "password": "",
                    "confirmPassword": ""
                }  
            },
            PUT: { link: "http://localhost:3000/v1/user/3", message: "Atualiza o usuario pelo ID, Precisa do token", defaultPayload: {
                    "firstname": "user firstname 2",
                    "surname": "user surname",
                    "email": "user@mail.com"
                }
            },
            DELETE: { link: "http://localhost:3000/v1/user/3", message: "Deleta o usuario pelo ID, Precisa do token"}
        },
        Category: {
            GET: {
                link: "http://localhost:3000/v1/category/3",
                message: "Pesquisar categoria pelo ID"
            },
            POST: {
                link: "http://localhost:3000/v1/category",
                message: "Criar uma nova categoria, precisa de token",
                defaultPayload: {
                    "name": "",
                    "slug": "",
                    "use_in_menu": true
                },
                auth: "Bearer token"
            },
            PUT: {
                link: "http://localhost:3000/v1/category/2",
                message: "Atualizar categoria pelo ID, precisa de token",
                defaultPayload: {
                    "name": "nao sei",
                    "slug": "cavalo",
                    "use_in_menu": false
                },
                auth: "Bearer token"
            },
            DELETE: {
                link: "http://localhost:3000/v1/category/10",
                message: "Deletar categoria pelo ID, precisa de token",
                auth: "Bearer token"
            }
        },
        Product: {
            SEARCH: {
                link: "http://localhost:3000/v1/product/search",
                message: "Pesquisar produtos com query params (limit, page, fields, match, option[id], category_ids, price-range)",
                example: "?limit=-1&match=jeans&option[14]=38"
            },
            GET: {
                link: "http://localhost:3000/v1/product/32",
                message: "Pesquisar produto pelo ID"
            },
            POST: {
                link: "http://localhost:3000/v1/product",
                message: "Criar novo produto, precisa de token",
                auth: "Bearer token",
                defaultPayload: {
                    "enabled": true,
                    "name": "",
                    "slug": "",
                    "stock": 0,
                    "description": "",
                    "price": 0,
                    "price_with_discount": 0,
                    "category_ids": [],
                    "images": [
                        {
                            "type": "image/png",
                            "content": "base64"
                        }
                    ],
                    "options": [
                        {
                            "title": "",
                            "shape": "square",
                            "type": "text",
                            "values": []
                        }
                    ]
                }
            },
            PUT: {
                link: "http://localhost:3000/v1/product/6",
                message: "Atualizar produto pelo ID, precisa de token",
                auth: "Bearer token",
                defaultPayload: {
                    "enabled": true,
                    "name": "Produto atualizado",
                    "slug": "produto-atualizado",
                    "stock": 0,
                    "description": "",
                    "price": 0,
                    "price_with_discount": 0,
                    "category_ids": [],
                    "images": [
                        {
                            "type": "image/png",
                            "content": "base64"
                        },
                        {
                            "content": "/uploads/imagem"
                        },
                        {
                            "id": 0,
                            "content": "imagem atualizada"
                        }
                    ],
                    "options": [
                        {
                            "id": 0,
                            "radius": "10px",
                            "values": []
                        },
                        {
                            "title": "",
                            "shape": "square",
                            "type": "text",
                            "values": []
                        }
                    ]
                }
            },
            DELETE: {
                link: "http://localhost:3000/v1/product/6",
                message: "Deletar produto pelo ID, precisa de token",
                auth: "Bearer token"
            }
        }
    }})
})

module.exports = app;
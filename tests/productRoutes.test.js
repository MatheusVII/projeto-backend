const request = require('supertest');
const app = require('../src/app.js');
const { Product } = require('../src/models');
const { Op } = require('sequelize');

const PRODUCT_TEST = "NomeDoProdutoParaTestes";
const PRODUCT_TEST_UPDATED = "NomeDoProdutoParaTestesAtualizado";
let token;

async function limparPostsDeTeste(){
    await Product.destroy({
        where: { name: { [Op.in]: [PRODUCT_TEST, PRODUCT_TEST_UPDATED] } }
    })
}

describe("-TESTE DAS ROTAS DO PRODUTO", () => {

    beforeAll(async () => {
        await limparPostsDeTeste();
        const res = await request(app).post("/v1/user/token").send({email: "test@gmail.com", password: "123@123"});
        token = res.body.token;
    })

    afterAll(async () => {
        await limparPostsDeTeste();
    })

    it("Deve criar o produto com sucesso", async () => {
        const res = await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 119.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        expect(res.statusCode).toBe(201);
    })

    it("Deve retornar os produtos com paginacao, mostrando o total, o limit e a page", async () => {
        const res = await request(app).get('/v1/product/search?limit=5&page=1');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('limit');
        expect(res.body).toHaveProperty('page');
    });

    it("Deve retornar apenas os campos name, price, price_with_discount", async () => {
        const res = await request(app).get('/v1/product/search?limit=5&page=1&fields=name,price,price_with_discount');

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0]).toHaveProperty('name');
        expect(res.body.data[0]).toHaveProperty('price');
        expect(res.body.data[0]).toHaveProperty('price_with_discount');
        expect(res.body.data[0]).not.toHaveProperty('slug');
    });

    it("Deve retornar os produtos com o nome ou a descricao parecidos com o match", async () => {
        await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 119.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        const res = await request(app).get(`/v1/product/search?limit=-1&match=${PRODUCT_TEST}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.every(p => p.name.toLowerCase().includes(PRODUCT_TEST.toLowerCase()) || p.description.toLowerCase().includes(PRODUCT_TEST.toLowerCase()) )).toBe(true);
    });

    it("Deve retornar os produtos que tenham o preco entre R$100 e R$200", async () => {
        await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 119.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 150.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 219.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        const res = await request(app).get('/v1/product/search?limit=-1&price-range=100-200');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.every(p => p.price >= 100 && p.price <= 200)).toBe(true)
    })

    it("Deve atualizar um produto com sucesso", async () => {
        const createRes = await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 119.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })  

        const prodId = createRes.body.data.id;

        const res = await request(app).put(`/v1/product/${prodId}`).set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST_UPDATED,
            "slug": PRODUCT_TEST_UPDATED,
            "stock": 20,
            "description": "Descrição do produto 01 atualizado",
            "price": 49.9,
            "price_with_discount": 0,
            "category_ids": [1, 2, 6],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "content": "/uploads/imagemdetest5"
                },
                {
                    "id": 7,
                    "content": "imagem atualizada" 
                }
            ],
            "options": [
                {
                    "id": 4,
                    "radius": "10px",
                    "values": ["42/43", "44/45"]
                },
                {
                    "title": "Tipo",
                    "shape": "square",
                    "type": "text",
                    "values": ["100% algodão", "65% algodão"]
                }
            ]
        })

        expect(res.statusCode).toBe(204);
    })

    it("Deve deletar um produto com sucesso", async () => {
        const createRes = await request(app).post('/v1/product').set({'Authorization' : `Bearer ${token}`}).send({
            "enabled": true,
            "name": PRODUCT_TEST,
            "slug": PRODUCT_TEST,
            "stock": 10,
            "description": "Descrição do produto 01",
            "price": 119.90,
            "price_with_discount": 99.90,
            "category_ids": [7, 3,2],
            "images": [ 
                {
                    "type": "image/png",
                    "content": "base64 da imagem 1" 
                },
                {
                    "type": "image/png",
                    "content": "base64 da imagem 2" 
                },
                {
                    "type": "image/jpg",
                    "content": "base64 da imagem 3" 
                }
            ],
            "options": [
                {
                    "title": "Cor",
                    "shape": "square",
                    "radius": "4px",
                    "type": "text",
                    "values": ["PP", "GG", "M"]
                },
                {
                    "title": "Tamanho",
                    "shape": "circle",
                    "type": "color",
                    "values": ["#000", "#333"]
                }
            ]
        })

        const prodId = createRes.body.data.id;

        const res = await request(app).delete(`/v1/product/${prodId}`).set({'Authorization' : `Bearer ${token}`});

        expect(res.statusCode).toBe(204);
    })
})
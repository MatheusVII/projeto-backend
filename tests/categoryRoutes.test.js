const request = require('supertest');
const app = require('../src/app.js');
const { Category } = require('../src/models');
const { Op } = require('sequelize');

const TEST_CATEGORY = "CategoriaDeTeste";
const UPDATED_TEST_CATEGORY = "CategoriaDeTesteAtualizada";

let token;

async function limparPostsDeTeste(){
    await Category.destroy({
        where: { name: { [Op.in]: [ TEST_CATEGORY, UPDATED_TEST_CATEGORY ] } }
    })
};

describe('GET /category/search', () => {

    beforeAll(async () => {
        await limparPostsDeTeste();
        const res = await request(app).post("/v1/user/token").send({email: "test@gmail.com", password: "123@123"});
        token = res.body.token;
    })

    afterAll(async () => {
        await limparPostsDeTeste();
    })

    it('deve retornar categorias de 2 em 2 com paginacao', async () => {
        const res = await request(app).get('/v1/category/search?limit=2&page=1');

        expect(res.statusCode).toBe(200);
    })

    it('Deve retornar as categorias que tem use_in_menu = false', async () => {
        const res = await request(app).get('/v1/category/search?limit=2&page=1&use_in_menu=false');

        expect(res.statusCode).toBe(200);
    })

    it('Deve retornar apenas o slug de todas as categorias', async () => {
        const res = await request(app).get("/v1/category/search?limit=2&page=1&fields=slug");

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0]).toHaveProperty('slug');
        expect(res.body.data[0]).not.toHaveProperty('name');
    })

    it("Deve retornar informacoes da categoria a partir de seu ID", async () => {
        const res = await request(app).get("/v1/category/3");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("name");
        expect(res.body).toHaveProperty("slug");
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("use_in_menu");
    })

    it("Deve criar uma nova categoria", async () => {
        const res = await request(app).post("/v1/category").set({'Authorization' : `Bearer ${token}`}).send({       
            name: TEST_CATEGORY,
            slug: TEST_CATEGORY,
            use_in_menu: true 
        });

        expect(res.statusCode).toBe(201);
    })

    it("Deve atualizar uma categoria existente", async () => {
        const createRes = await request(app).post("/v1/category").set({'Authorization' : `Bearer ${token}`}).send({       
            name: TEST_CATEGORY,
            slug: TEST_CATEGORY,
            use_in_menu: true 
        });

        const categoryId = createRes.body.data.id

        expect(createRes.statusCode).toBe(201);

        const res = await request(app).put(`/v1/category/${categoryId}`).set({'Authorization' : `Bearer ${token}`}).send({
            name: UPDATED_TEST_CATEGORY,
            slug: UPDATED_TEST_CATEGORY,
            use_in_menu: false
        })

        expect(res.statusCode).toBe(204);
    });

    it("Deve deletar uma categoria existente", async () => {
        const createRes = await request(app).post("/v1/category").set({'Authorization' : `Bearer ${token}`}).send({       
            name: TEST_CATEGORY,
            slug: TEST_CATEGORY,
            use_in_menu: true 
        });
        
        const categoryId = createRes.body.data.id;

        const res = await request(app).delete(`/v1/category/${categoryId}`).set({'Authorization' : `Bearer ${token}`});

        expect(res.statusCode).toBe(204);
    })
})
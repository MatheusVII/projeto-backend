const request = require('supertest');
const app = require('../src/app.js');
const { User } = require('../src/models');
const { Op } = require('sequelize');

const USER_TEST = "emailDeTeste@gmail.com";
const USER_TEST_2 = "emailDeTeste2@gmail.com";
const UPDATED_USER_TEST = "emailDeTesteAtualizado@gmail.com";
let token;

async function limparPostsDeTestes(){
    await User.destroy({
        where: { email: { [Op.in]: [USER_TEST, UPDATED_USER_TEST, USER_TEST_2]}}
    })
}

describe("-TESTE DAS ROTAS DE USUARIO-", () => {

    beforeAll(async () => {
        await limparPostsDeTestes();
        const res = await request(app).post("/v1/user/token").send({email: "test@gmail.com", password: "123@123"});
        token = res.body.token;
    })
    
    afterAll(async () => {
        await limparPostsDeTestes();
    })

    it("Deve retornar os dados do usuario a partir do ID", async () => {
        const res = await request(app).get('/v1/user/4');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('firstname');
        expect(res.body).toHaveProperty('surname');
        expect(res.body).toHaveProperty('email');
        expect(res.body).not.toHaveProperty('password');
    })

    it("Deve criar um usuario com sucesso", async () => {
        const res = await request(app).post('/v1/user/').send({
            firstname: "userTest",
            surname: "test",
            email: USER_TEST,
            password: "123@123",
            confirmPassword: "123@123"
        })

        expect(res.statusCode).toBe(201);
        expect(res.body.data.id).not.toBeNull();
        expect(res.body.data.id).not.toBeUndefined();
    })

    it("Deve atualizar um usuario ja existente", async () => {
        const createRes = await request(app).post('/v1/user/').send({
            firstname: "userTest",
            surname: "test",
            email: USER_TEST_2,
            password: "123@123",
            confirmPassword: "123@123"
        })

        expect(createRes.statusCode).toBe(201);

        const userId = createRes.body.data.id;

        const res = await request(app).put(`/v1/user/${userId}`).set({'Authorization' : `Bearer ${token}`}).send({
            firstname: "userTest",
            surname: "test",
            email: UPDATED_USER_TEST
        })

        expect(res.statusCode).toBe(204);
    })

    it("Deve deletar um usuario exitente com sucesso", async () => {
        const createRes = await request(app).post('/v1/user/').send({
            firstname: "userTest",
            surname: "test",
            email: USER_TEST_2,
            password: "123@123",
            confirmPassword: "123@123"
        })

        const userId = createRes.body.data.id;

        const res = await request(app).delete(`/v1/user/${userId}`).set({'Authorization' : `Bearer ${token}`});

        expect(res.statusCode).toBe(204)
    })
})
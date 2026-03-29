const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const { User } = require('../models');

router.get('/user/:id', async (req, res) => {
    try {
        //Pego o ID dos parametros da request
        const { id } = req.par
        
        //Puxo os dados relevantes do usuario pelo ID
        const user = await User.findByPk(id, {
            attributes: ['id', 'firstname', 'surname', 'email']
        })

        //Verifico se o usuario existe, se nao, retorno erro 404
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        //Se exite, retorno os dados do usuario
        return res.status(200).json(user);

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.post('/user', async (req, res) => {
    try{
        //Pego os dados da request
        const { firstname, surname, email, password, confirmPassword } = req.body;

        //Verifico se tem algum parametro vazio, se sim, retorno Bad Request
        if(!firstname || !surname || !email || !password || !confirmPassword){
            return res.status(400).json({message: "Preencha todos os campos!"});
        }

        //Funcao com regex para testar se o email e valido
        const emailValido = (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        //Testo o email recebido com a funcao de testar email, se false/nao valido, retorno Bad Request
        if(!emailValido(email)){
            return res.status(400).json({message: "Email invalido!"});
        }

        //Verifico se a senha tem pelo menos 6 caracteres, se nao, retorna Bad Request
        if(password.length < 6){
            return res.status(400).json({message: "Senha muito curta"});
        }

        //Verifico se a senha esta igual ao confirmar senha, se nao, retorno Bad Request
        if(password != confirmPassword){
            return res.status(400).json({message: "As senhas sao diferentes"});
        }

        //Pesquiso o email recebido no banco de dados
        const user = await User.findOne({
            where: { email: email }
        })

        //Se o retorno nao estiver vazio, retorno codigo 409 de email ja cadastrado
        if(user){
            return res.status(409).json({message: "email ja cadastrado!"})
        }

        //Criptografo a senha recebida para inserir no banco de dados
        const hashPassword = await bcrypt.hash(password, 10);

        //Crio o novo usuario
        novoUser = await User.create({
            firstname: firstname,
            surname: surname,
            email: email,
            password: hashPassword
        })

        //Verifico se a acao de criar foi bem sucedida
        if(novoUser){
            return res.status(201).json({message: "Usuario criado com sucesso", data: {id: novoUser.id}});
        } 

        //Se nao, retorno erro codigo 500
        return res.status(500).json({message: "Erro ao criar usuario"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Iternal server error"});
    }
})

router.post('/user/token', async(req, res) => {
    try{
        //Pego os dados da request
        const { email, password } = req.body;

        //Verifico se estao vazios, se sim, retorno Bad Request
        if(!email || !password){
            return res.status(400).json({message: "Campos vazios"});
        }

        //Pesquiso o email recebido no banco de dados
        const user = await User.findOne({
            where: { email: email }
        })

        //Verfico se o email exite, se nao, retorno Bad Request
        if(!user){
            return res.status(400).json({message: "Credenciais invalidas"});
        }

        //Verifico com o Bcrypt se a senha Hash do banco e a senha recebida sao iguais
        const passMatch = await bcrypt.compare(password, user.password);

        //Se nao forem iguais, retorna Bad Request
        if(!passMatch){
            return res.status(400).json({message: "Credenciais invalidas"});
        }

        //Gero o Token de autenticacao
        const token = jwt.sign(
            { id: user.id, email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: "1d" } 
        );

        //Retorno sucesso e o Token
        return res.status(200).json({token: token});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.put('/user/:id', authMiddleware, async (req, res) => {
    try{
        //Pego o ID do usuario na request
        const userId = req.params.id;

        //Pego o corpo da request
        const { firstname, surname, email } = req.body;

        //Verifico se os dados estao vazios, se sim, retorno Bad Request
        if(!firstname || !surname || !email) {
            return res.status(400).json({message: "alguns campos estao vazios"});
        }

        //Pesquiso o usuario pelo ID no banco de dados
        const user = await User.findByPk(userId);

        //Verifico se ele existe, se nao, retorno 404
        if(!user){
            return res.status(404).json({message: "Usuario nao encontrado!"});
        }

        //Atualizo o usuario com as informacoes recebidas
        await User.update({
            firstname: firstname,
            surname: surname,
            email: email
        },
        {
            where: { id: userId }
        });

        //Retorno sucesso
        return res.status(204).json();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error!"});
    }
})

router.delete('/user/:id', authMiddleware, async (req, res) => {
    try{
        //Pego o ID do usuario na request
        const userId = req.params.id;

        //Deleto o usuario pelo o ID
        const deletado = await User.destroy({
            where: {id: userId}
        });

        //Verifico se o usuario foi deletado com sucesso, se nao, retorno 404
        if(!deletado){
            return res.status(404).json({message: "Usuario nao encontrado"});
        }

        //Retorno sucesso
        return res.status(204).json();
        
    } catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;
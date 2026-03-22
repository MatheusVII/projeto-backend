const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

const { User } = require('../models');

router.get('/user/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: ['id', 'firstname', 'surname', 'email']
        })

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        return res.status(200).json(user);

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.post('/user', async (req, res) => {
    try{
        const {firstname, surname, email, password, confirmPassword} = req.body;

        if(!firstname || !surname || !email || !password || !confirmPassword){
            return res.status(400).json({message: "Preencha todos os campos!"});
        }

        const emailValido = (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        if(!emailValido(email)){
            return res.status(400).json({message: "Email invalido!"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Senha muito curta"});
        }

        if(password != confirmPassword){
            return res.status(400).json({message: "As senhas sao diferentes"});
        }

        const user = await User.findOne({
            where: { email: email }
        })

        if(user){
            return res.status(409).json({message: "email ja cadastrado!"})
        }

        const hashPassword = await bcrypt.hash(password, 10);

        novoUser = await User.create({
            firstname: firstname,
            surname: surname,
            email: email,
            password: hashPassword
        })

        if(novoUser){
            return res.status(201).json({message: "Usuario criado com sucesso"});
        } 

        return res.status(500).json({message: "Erro ao criar usuario"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Iternal server error"});
    }
})

router.put('/user/:id', async (req, res) => {
    try{
        const userId = req.params.id;

        const { firstname, surname, email } = req.body;

        const user = await User.findByPk(userId);

        if(!user){
            return res.status(404).json({message: "Usuario nao encontrado!"});
        }

        await User.update({
            firstname: firstname,
            surname: surname,
            email: email
        },
        {
            where: { id: userId }
        });

        return res.status(200).json({message: "Usuario atualizado com sucesso"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error!"});
    }
})

router.delete('/user/:id', async (req, res) => {
    try{
        const userId = req.params.id;

        const deletado = await User.destroy({
            where: {id: userId}
        });

        if(!deletado){
            return res.status(404).json({message: "Usuario nao encontrado"});
        }

        return res.status(200).json({message: "Usuario deletado com sucesso"});
        
    } catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;
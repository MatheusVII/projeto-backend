const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const Category = require('../models/CategoryModel.js');

router.get('/category/search', async (req, res) => {
    try{    
        //Pegando as query options da request
        let { limit = 12, page = 1, fields, use_in_menu } = req.query;

        //Passando os valores para Inteiro
        limit = parseInt(limit);
        page = parseInt(page);

        //Verificando se esses valores não são numeros
        if(isNaN(limit) || isNaN(page)){
            return res.status(400).json({message: "Parametros invalidos"});
        }

        //Criando o where principal
        const where = {};

        //Verificando se o use_in_meno do query options esta indefinido, se sim, define como true, senao manda para o where
        if(use_in_menu === undefined) {
            where.use_in_menu = use_in_menu === "true";
        } else{
            where.use_in_menu = use_in_menu;
        }

        
        let attributes;
        //Verifica se o atributo fields tem algum valor definido, se sim, joga os valores de fields para a variavel attributes, se nao deixa attributes vazio
        if(fields){
            attributes = fields.split(",");
        }

        let result;
        let total;

        //Verifica se o atributo limit e igual a -1, se sim, pesquisa todos as categorias da tabela sem paginacao
        if(limit === -1){
            result = await Category.findAll({
                where,
                attributes
            });

            total = result.length;
        } 
        //Senao, define o offset e retorna as categorias de acordo com o limit e a page definidos na request, e tambem de acordos com os outros query options
        else{
            const offset = (page - 1) * limit;

            const response = await Category.findAndCountAll({
                where,
                attributes,
                limit,
                offset
            })

            result = response.rows;
            total = result.count;
        }

        //Retorna as categorias de acordo com as query options
        return res.status(200).json({data: result, total, limit, page: limit === -1 ? 1 : page});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.get('/category/:id', async (req, res) => {
    try{
        //Pega o parametro id da request
        const catId = req.params.id;

        //Pesquisa a categoria de acordo com o ID
        const result = await Category.findByPk(catId);

        //Pega os campos relevantes para o retorno
        const {id, name, slug, use_in_menu} = result;

        //Verifica se o result esta vazio
        if(!result){
            return res.status(404).json({message: "Categoria nao encontrada"});
        }

        //Retorna a categoria pesquisada
        return res.status(200).json({
            id: id,
            name: name,
            slug: slug,
            use_in_menu: use_in_menu
        })
    } catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }

})

router.post('/category', authMiddleware, async (req, res) => {
    try{
        //Pega os atributos da request
        const { name, slug, use_in_menu } = req.body;

        //Verifica se os campos estao vazios
        if(!name || !slug || !use_in_menu){
            return res.status(400).json({message: "Preencha todos os campos"});
        }

        //Cria a categoria de acordo com os atrinutos da request
        const createRes = await Category.create({
            name: name,
            slug: slug,
            use_in_menu: use_in_menu
        })

        //Retorna o codigo de sucesso
        return res.status(201).json({message: "Categoria criada com sucesso!", data:{id: createRes.id}});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }

})

router.put('/category/:id',  authMiddleware, async (req, res) => {
    try{
        //Pega o parametro ID da request
        const catId = req.params.id;

        //Verifica se existe alguma categoria no banco de dados com esse ID
        const result = await Category.findByPk(catId);

        //Se nao existir retorna 404
        if(!result){
            return res.status(404).json({message: "Categoria nao encontrada!"});
        }

        //Se existir, pega os atributos da request
        const { name, slug, use_in_menu } = req.body;

        //Verifica se os atributos estao vazios
        if(!name || !slug || use_in_menu === undefined){
            return res.status(400).json({message: "Alguns campos estao vazios!"});
        }

        //Finalmente atualiza o produto
        await Category.update({
            name: name,
            slug: slug,
            use_in_menu: use_in_menu
        },
        {
            where: {id: catId}
        }
        );

        //Retorna o sucesso na atualizacao
        return res.status(204).json();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.delete('/category/:id',  authMiddleware, async (req, res) => {
    try{
        //Pega o parametro ID da request
        const catId = req.params.id;

        //Tenta deletar a categoria de acordo com o ID
        const deletado = Category.destroy({
            where: {id: catId}
        });

        //Verifica se a acao de deletar teve sucesso
        if(!deletado){
            return res.status(404).json({message: "Categoria nao encontrada"});
        }

        //Em caso de sucesso, retorna 204
        return res.status(204).json();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;
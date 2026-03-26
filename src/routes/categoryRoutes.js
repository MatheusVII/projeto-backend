const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const Category = require('../models/CategoryModel.js');

router.get('/category/search', async (req, res) => {
    try{    
        let { limit = 12, page = 1, fields, use_in_menu } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        if(isNaN(limit) || isNaN(page)){
            return res.status(400).json({message: "Parametros invalidos"});
        }

        const where = {};

        if(use_in_menu !== undefined) {
            where.use_in_menu = use_in_menu === "true";
        }

        let attributes;
        if(fields){
            attributes = fields.split(",");
        }

        let result;
        let total;

        if(limit === -1){
            result = await Category.findAll({
                where,
                attributes
            });

            total = result.length;
        } else{
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

        return res.status(200).json({data: result, total, limit, page: limit === -1 ? 1 : page});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.get('/category/:id', async (req, res) => {
    try{
        const catId = req.params.id;

        const result = await Category.findByPk(catId);

        const {id, name, slug, use_in_menu} = result;

        if(!result){
            return res.status(404).json({message: "Categoria nao encontrada"});
        }

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
        const { name, slug, use_in_menu } = req.body;

        if(!name || !slug || !use_in_menu){
            return res.status(400).json({message: "Preencha todos os campos"});
        }

        await Category.create({
            name: name,
            slug: slug,
            use_in_menu: use_in_menu
        })

        return res.status(201).json({message: "Categoria criada com sucesso!"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }

})

router.put('/category/:id',  authMiddleware, async (req, res) => {
    try{
        const catId = req.params.id;

        const result = await Category.findByPk(catId);

        if(!result){
            return res.status(404).json({message: "Categoria nao encontrada!"});
        }

        const { name, slug, use_in_menu } = req.body;

        if(!name || !slug || use_in_menu === undefined){
            return res.status(400).json({message: "Alguns campos estao vazios!"});
        }

        await Category.update({
            name: name,
            slug: slug,
            use_in_menu: use_in_menu
        },
        {
            where: {id: catId}
        }
        );

        return res.status(204).json();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.delete('/category/:id',  authMiddleware, async (req, res) => {
    try{
        const catId = req.params.id;

        const deletado = Category.destroy({
            where: {id: catId}
        });

        if(!deletado){
            return res.status(404).json({message: "Categoria nao encontrada"});
        }

        return res.status(204).json();
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const { Op } = require('sequelize');
const { Product, ProductOption, Category, ProductCategory, ProductImage } = require('../models');

router.get('/product/search', async(req, res) => {
    try{
        let { limit = 30, page = 1, fields, match, category_ids, "price-range" : priceRange, ...rest } = req.query;

        limit = parseInt(limit); 
        page = parseInt(page);

        if(isNaN(limit) || isNaN(page)){
            return res.status(400).json({message: "Parametros invalidos"});
        }

        let where = {};

        if(match) {
            where[Op.or] = [
                {name: { [Op.iLike]: `%${match}%`}},
                {description: { [Op.iLike]: `%${match}%`}}
            ];
        }

        if(priceRange){
            const[min, max] = priceRange.split('-').map(Number);
            if(!isNaN(min) && !isNaN(max)) {
                where.price = { [Op.between]: [min, max] };
            }
        }

        let queryOptions = {
            where, 
            distinct: true
        };

        if(category_ids){
            const ids = category_ids.split(',').map(Number);

            queryOptions.include = queryOptions.include || [];

            queryOptions.include.push({
                model: Category,
                where: {id: { [Op.in]: ids}},
                through: { attributes: [] },
                required: true
            })
        }

        let optionFilters = [];

        Object.keys(rest).forEach(key => {
            if(key.startsWith('option[')) {
                const optionId = parseInt(key.match(/\d+/)[0]);
                const values = rest[key].split(',');

                optionFilters.push({
                    id: optionId,
                    [Op.or]: values.map(v => ({
                        values: { [Op.iLike]: `%${v}%` }
                    }))
                });
            }
        });

        if(limit !== -1){
            queryOptions.limit = limit;
            queryOptions.offset = (page - 1) * limit;
        }

        if (optionFilters.length) {
            queryOptions.include = queryOptions.include || [];

            optionFilters.forEach(filter => {
                queryOptions.include.push({
                    model: ProductOption,
                    required: true,
                    where: {
                        id: filter.id,
                        [Op.or]: filter[Op.or]
                    }
                });
            });
        }

        if(fields){
            queryOptions.attributes = fields.split(',');
        }

        const { rows, count } = await Product.findAndCountAll(queryOptions);

        res.status(200).json({
            data: rows,
            total: count,
            limit,
            page
        });
    } catch(err){
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    }
})

router.get('/product/:id', async(req, res) => {
    try{
        const prodId = req.params.id;

        const result = await Product.findByPk(prodId);

        const { id, enabled, name, slug, stock, description, price, price_with_discount } = result;

        const ids = await ProductCategory.findAll({
            where: {product_id: prodId},
            attributes: ['category_id']
        });

        const options = await ProductOption.findAll({
            where: {
                product_id: prodId
            }
        })

        const images = await ProductImage.findAll({
            where: { product_id: id },
            attributes: ['id', 'path']
        })

        let category_ids = [];

        if(ids.length){
            ids.forEach(id => {
                category_ids.push(id.category_id);
            })
        }

        return res.status(200).json({
            id: id,
            enabled: enabled, 
            name: name,
            slug: slug,
            stock: stock,
            description: description,
            price: price,
            price_with_discount: price_with_discount,
            category_ids: category_ids,
            images: images,
            options: options
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.post('/product', authMiddleware, async(req, res) => {
    try{
        const { enabled, name, slug, stock, description, price, price_with_discount, category_ids, images, options } = req.body;

        if(!enabled || !name || !slug || !stock || !description || !price || !category_ids || !images || !options){
            return res.status(400).json({message: "Preencha todos os campos"});
        }

        const productReturn = await Product.create({
            enabled: enabled,
            name: name,
            slug: slug,
            stock: stock,
            description: description,
            price: price,
            price_with_discount: price_with_discount
        });

        for (catId of category_ids) {
            await ProductCategory.create({
                product_id: productReturn.id,
                category_id: catId
            })
        }

        if(options){
            for (opt of options) {
                await ProductOption.create({
                    product_id: productReturn.id,
                    title: opt.title,
                    shape: opt.shape,
                    radius: opt.shape === "square" ? parseInt(opt.radius) : 0,
                    type: opt.type,
                    values: opt.values.join(",")
                })
            }
        }

        if(images){
            imagesNumber = images.length;
            imagesArray = new Array(imagesNumber).fill("uploads/imagem-teste.png");
            for (img of imagesArray) {
                await ProductImage.create({
                    product_id: productReturn.id,
                    enabled: true,
                    path: img
                })
            }
        }

        return res.status(201).json({message: "Produto criado com sucesso"});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.put('/product/:id', authMiddleware, async(req, res) => {
    try{
        const prodId = req.params.id;
        const { enabled, name, slug, stock, description, price, price_with_discount, category_ids, images, options } = req.body;

        const result = await Product.update({
            enabled: enabled,
            name: name,
            slug: slug,
            stock: stock,
            description: description,
            price: price,
            price_with_discount: price_with_discount
        },
        {
            where: { id: prodId }
        }
    );

    const ids = await ProductCategory.findAll({
        where: {
            product_id: prodId
        },
        attributes: ['category_id']
    });

    let actual_cat_ids = ids.length > 0 ? ids.map(id => id.category_id) : [];
    let newCats = actual_cat_ids.length === 0 ? category_ids : [];

    if(actual_cat_ids.length){
        for (catId of category_ids) {
            if(actual_cat_ids.includes(parseInt(catId))){
                actual_cat_ids = actual_cat_ids.filter(id => id !== catId);
            } else{
                newCats.push(catId);
            }
        }
    }

    if(actual_cat_ids.length){
        await ProductCategory.destroy({
            where: { 
                category_id:{ [Op.in]: actual_cat_ids },
                product_id: prodId
            }
        })
    }

    if(newCats.length){
        for (catId of newCats){
            await ProductCategory.create({
                product_id: prodId,
                category_id: catId
            })
        }
    }

    if(images){
        for (img of images){
            if(img.deleted){
                await ProductImage.destroy({
                    where: { id: img.id }
                })
            }
            else if(img.id && !img.deleted){
                await ProductImage.update({
                    enabled: img.enabled || true,
                    path: img.content
                },{
                    where: { id: img.id }
                }) 
            } 
            else{
                await ProductImage.create({
                    enabled: img.enabled || true, 
                    path: img.content,
                    product_id: prodId
                })
            }
        }
    }

    if(options.length > 0){
        for (opt of options) {
            if(opt.deleted){
                await ProductOption.destroy({
                    where: { id: opt.id }
                })
            } 

            if(opt.id && !opt.deleted){
                console.log(opt)
                await ProductOption.update({
                    title: opt.title || "",
                    shape: opt.shape || "square",
                    radius: parseInt(opt.radius) || 0,
                    type: opt.type || "text",
                    values: opt.values.join(",")
                },
                {
                    where:{ id: opt.id }
                }
                )
            } 
            else{
                await ProductOption.create({
                    product_id: prodId,
                    title: opt.title,
                    shape: opt.shape,
                    type: opt.type,
                    values: opt.values.join(",")
                })
            }
        }
    }

    if(result.length){
        return res.status(204).json();
    }

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Intenal server error"});
    }
})

router.delete('/product/:id', authMiddleware, async(req, res) => {
    try{
        const prodId = req.params.id;

        const deletado = await Product.destroy({
            where: { id: prodId }
        });

        if(deletado){
            return res.status(204).json();
        }

        return res.status(404).json({message: "Produto nao encontrado"});

    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports = router;
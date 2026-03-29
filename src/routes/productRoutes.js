const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

const { Op } = require('sequelize');
const { Product, ProductOption, Category, ProductCategory, ProductImage } = require('../models');

router.get('/product/search', async(req, res) => {
    try{
        //Pega os query params da request
        let { limit = 30, page = 1, fields, match, category_ids, "price-range" : priceRange, ...rest } = req.query;

        //Passa o valor de do limit e da page para Inteiro
        limit = parseInt(limit); 
        page = parseInt(page);

        //Verifica se o limit e o page sao numeros, se nao, retorna Bad Request
        if(isNaN(limit) || isNaN(page)){
            return res.status(400).json({message: "Parametros invalidos"});
        }

        //Cria o where principal
        let where = {};

        //Verifica se o match tem algum valor,  se sim, atribui ele dentro do where
        if(match) {
            where[Op.or] = [
                {name: { [Op.iLike]: `%${match}%`}},
                {description: { [Op.iLike]: `%${match}%`}}
            ];
        }

        //Verifica se o price range tem valor, se sim, separa o valor dele em Min e Max, verifica se sao numeros e atribui no where.price
        if(priceRange){
            const[min, max] = priceRange.split('-').map(Number);
            if(!isNaN(min) && !isNaN(max)) {
                where.price = { [Op.between]: [min, max] };
            }
        }

        //Atribui o where no objeto query options e adiciono distinct: true para evitar valores repetidos
        let queryOptions = {
            where, 
            distinct: true
        };

        //Verifica se category_ids tem algum valor, se sim, adciono seu valor tratado em ids, saindo de "3, 4, 2" para [3, 4, 2], e crio a atributo include
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

        //Crio a variavel optionFilter para uma pesquisa com as opcoes dos produtos
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

        //Verifica e o limit tem valor igual a -1, se sim, atribui ao queryOptions.limit, e cria o offset
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

        //Verifica se fields tem algum valor, se sim, atribui esse valor a queryOptions.attributes
        if(fields){
            queryOptions.attributes = fields.split(',');
        }

        //Pega o resultado e o total da query na tabela de produtos no banco de dados passando a query option que foi montada anteriormente
        const { rows, count } = await Product.findAndCountAll(queryOptions);

        //Retorna os dados com codigo de sucesso
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
        //Pega o ID do produto na request
        const prodId = req.params.id;

        //Pesquisa o produto na tabela do banco de dados pelo ID e atribui o resultado para a variavel result
        const result = await Product.findByPk(prodId);

        //Pega os campos de relevancia do result
        const { id, enabled, name, slug, stock, description, price, price_with_discount } = result;

        //Pesquisa os IDs das categorias relacionadas com com o ID do produto
        const ids = await ProductCategory.findAll({
            where: {product_id: prodId},
            attributes: ['category_id']
        });

        //Pega as options que estao relacionadas com o ID do produto
        const options = await ProductOption.findAll({
            where: {
                product_id: prodId
            }
        })

        //Pega as imagens que estao relacionadas com o ID do produto
        const images = await ProductImage.findAll({
            where: { product_id: id },
            attributes: ['id', 'path']
        })

        //Cria a variavel category_ids
        let category_ids = [];

        //Atribui cada posicao do array ids no novo array category_ids
        if(ids.length){
            ids.forEach(id => {
                category_ids.push(id.category_id);
            })
        }

        //Retorna os dados
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
        //Pega os dados da request
        const { enabled, name, slug, stock, description, price, price_with_discount, category_ids, images, options } = req.body;

        //Verifica se estao vazios, se sim, retorna Bad Request
        if(!enabled || !name || !slug || !stock || !description || !price || !category_ids || !images || !options){
            return res.status(400).json({message: "Preencha todos os campos"});
        }

        //Cria o produto com os dados da request e atribui a resposta a variavel productReturn
        const productReturn = await Product.create({
            enabled: enabled,
            name: name,
            slug: slug,
            stock: stock,
            description: description,
            price: price,
            price_with_discount: price_with_discount
        });

        //Cria o relacionamento do produto com as categorias selecionadas na request
        for (catId of category_ids) {
            await ProductCategory.create({
                product_id: productReturn.id,
                category_id: catId
            })
        }

        //Verifica se o array options tem algum valor, se sim, percorre esse array criando as options que se relacionam com o produto criado
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

        //Verifica se o array images tem algum valor, se sim, cria o relacionamento das imagens com o produto no banco de dados
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

        //Retorna sucesso
        return res.status(201).json({message: "Produto criado com sucesso", data: {id: productReturn.id}});
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

router.put('/product/:id', authMiddleware, async(req, res) => {
    try{
        //Pega o ID do produto no parametros da request
        const prodId = req.params.id;

        //Pega os valores do corpo da requisicao
        const { enabled, name, slug, stock, description, price, price_with_discount, category_ids, images, options } = req.body;

        //Atualiza o produto de acordo com ID fornecido
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

    //Verifico se o update deu certo
    if(!result){
        return res.status(500).json({message: "Erro ao atualizar o produto"})
    }

    //Pega o ID das categorias atualmente relacionadas com o ID do produto e atribui em ids
    const ids = await ProductCategory.findAll({
        where: {
            product_id: prodId
        },
        attributes: ['category_id']
    });

    //Crio a variavel actual_cat_ids para atribuir os IDs das categorias atualmente relacionadas com esse produto
    let actual_cat_ids = ids.length > 0 ? ids.map(id => id.category_id) : [];
    
    //Crio a variavel newCats para atribuir os IDs das categorias que vieram na request, se o actual_cat_ids estiver vazio, atribuo o category_ids da request como valor
    let newCats = actual_cat_ids.length === 0 ? category_ids : [];

    //Verifico de o actual_cat_ids esta vazio
    if(actual_cat_ids.length){
        //Percorro o category_ids
        for (catId of category_ids) {
            //Verifico se o valor de catId esta presente no actual_cat_ids
            if(actual_cat_ids.includes(parseInt(catId))){
                //Se sim, retiro esse valor de dentro do array de categorias atuais
                actual_cat_ids = actual_cat_ids.filter(id => id !== catId);
            } else{
                //Se nao estiver, adiciono no array de novas categorias
                newCats.push(catId);
            }
        }
    }

    //Verifico se sobrou algum valor no array de categorias atuais, os valores que sobrarem nesse array sao relacionamentos que devem ser apagados
    if(actual_cat_ids.length){
        //Se sim, apago da tabela de relacionamento
        await ProductCategory.destroy({
            where: { 
                category_id:{ [Op.in]: actual_cat_ids },
                product_id: prodId
            }
        })
    }

    //Verifico se o array de novas categorias tem algum valor, os valores desse array sao novos relacionamentos de categoria com produto que devem ser criados
    if(newCats.length){
        //Percorro esse array
        for (catId of newCats){
            //Pra cada ID de categoria eu crio um relacionamento com o produto
            await ProductCategory.create({
                product_id: prodId,
                category_id: catId
            })
        }
    }

    //Verifico se o array de imagens tem algum valor
    if(images){
        //Se sim, percorro ele
        for (img of images){
            //Verifico se o atributo deleted existe, se sim, apago essa imagem
            if(img.deleted){
                await ProductImage.destroy({
                    where: { id: img.id }
                })
            }
            //Verifico se o atributo ID existe e verifico se o atributo deleted nao existe, porque imagens com o deleted tambem tem ID, se sim, atualizo a imagem
            else if(img.id && !img.deleted){
                await ProductImage.update({
                    enabled: img.enabled || true,
                    path: img.content
                },{
                    where: { id: img.id }
                }) 
            } 
            //Se nao tiver nem deleted nem ID, crio o novo relacionamento de produto imagem no banco de dados
            else{
                await ProductImage.create({
                    enabled: img.enabled || true, 
                    path: img.content,
                    product_id: prodId
                })
            }
        }
    }

    //Verifico se o array options tem algum valor
    if(options.length > 0){
        //Se sim percorro ele
        for (opt of options) {
            ////Verifico se o atributo deleted existe, se sim, apago essa imagem
            if(opt.deleted){
                await ProductOption.destroy({
                    where: { id: opt.id }
                })
            } 
            //Verifico se o atributo ID existe e verifico se o atributo deleted nao existe, porque options com o deleted tambem tem ID, se sim, atualizo a option
            if(opt.id && !opt.deleted){
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
            //Se nao tiver nem deleted nem ID, crio o novo relacionamento de produto com option no banco de dados
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

    //Retorno sucesso
    return res.status(204).json();

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
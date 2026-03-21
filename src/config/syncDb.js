const sequelize = require('./db.js');

const User = require('../models/UserModel.js');
const Category = require('../models/CategoryModel.js');
const Product = require('../models/ProductModel.js');
const ProductImage = require('../models/ProductImage.js');
const ProductOption = require('../models/ProductOptionModel.js');

(async () => {
    try{
        await sequelize.sync({logging: console.log });
        console.log('Tabelas sicronizadas');
    } catch(err) {
        console.log("Erro ao sicronizar: ", err);
    }

})();
const sequelize = require('./db.js');

const User = require('../models/userModel.js');
const Category = require('../models/categoryModel.js');
const products = require('../models/productModel.js');

(async () => {
  await sequelize.sync();
  console.log('Tabela criada user criada');
})();
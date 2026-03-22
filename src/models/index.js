const sequelize = require('../config/db.js');
const { DataTypes } = require('sequelize');

const Category = require('./CategoryModel.js');
const Product = require('./ProductModel.js');
const ProductCategory = require('./ProductCategoryModel.js');
const ProductImage = require('./ProductImage.js');
const ProductOption = require('./productOptionModel.js');

Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: 'product_id',
  otherKey: 'category_id'
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: 'category_id',
  otherKey: 'product_id'
});

Product.hasMany(ProductImage, {
  foreignKey: 'product_id'
});

ProductImage.belongsTo(Product, {
  foreignKey: 'product_id'
});

Product.hasMany(ProductOption, {
  foreignKey: 'product_id'
});

ProductOption.belongsTo(Product, {
  foreignKey: 'product_id'
});

module.exports = {
  sequelize,
  Category,
  Product,
  ProductCategory,
  ProductImage,
  ProductOption
};
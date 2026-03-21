const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const ProductImage = require('./ProductImage.js');
const ProductOption = require('./ProductOptionModel.js');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  use_in_menu: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  price_with_discount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
});

Product.hasMany(ProductImage, {foreignKey: "product_id"});
Product.hasMany(ProductOption, {foreignKey: "product_id"})

module.exports = Product;
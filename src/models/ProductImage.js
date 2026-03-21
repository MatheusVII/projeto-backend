const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Product = require('./ProductModel.js');

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // nome da tabela
      key: 'id',
    },
    onDelete: 'CASCADE', // se deletar produto, deleta imagens 🔥
    onUpdate: 'CASCADE',
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'product_images',
  timestamps: true,
  underscored: true,
});

ProductImage.belongsTo(Product, {foreignKey: 'product_id'})

module.exports = ProductImage;
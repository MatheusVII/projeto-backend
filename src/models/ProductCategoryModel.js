const { DataTypes } = require('sequelize');

const sequelize = require('../config/db.js');

const ProductCategory = sequelize.define('ProductCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },

    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    }
},

{
    tableName: 'product_categories'
}
);

module.exports = ProductCategory;
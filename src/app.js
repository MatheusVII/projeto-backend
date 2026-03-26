const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const productRoutes = require('./routes/productRoutes.js');

app.use('/v1', userRoutes);

app.use('/v1', categoryRoutes);

app.use('/v1', productRoutes);

app.get('/', (req, res) => {
    return res.json({message: "deu certo"})
})

module.exports = app;
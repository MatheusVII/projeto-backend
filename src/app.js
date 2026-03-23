const express = require('express');
const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes.js');

const categoryRoutes = require('./routes/categoryRoutes.js');

app.use('/v1', userRoutes);

app.use('/v1', categoryRoutes);

app.get('/', (req, res) => {
    return res.json({message: "deu certo"})
})

module.exports = app;
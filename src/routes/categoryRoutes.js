const express = require('express');

const router = express.Router();

const Category = require('../models/CategoryModel.js');

router.get('/category/search', async (req, res) => {
    try{    
        
    } catch(err) {
        console.log(err);
        return res.status(500).json({message: "Internal server error"});
    }
})
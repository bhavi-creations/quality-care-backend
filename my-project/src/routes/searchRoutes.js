const express = require('express');
const router = express.Router();
const pool = require('../database');


// Create a new category
router.get('/',  async (req, res) => {
    try {
        const { title } = req.query;
        let titleQuery = title ? `WHERE products.title LIKE '%${title}%' OR categories.categoryName LIKE '%${title}%' OR subcategory.subcategoryName LIKE '%${title}%'` : '';
        const query = `
            Select products.ID as productId, categories.ID as mcID, subcategory.ID as scID, products.title, categories.categoryName,subcategory.subcategoryName from products as products
            JOIN categories as categories ON products.mcID = categories.ID
            JOIN subcategory as subcategory ON categories.ID = subcategory.mcID
            ${titleQuery} limit 10;
        `;
        console.log(query)
        await pool.query(query, async function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    res.json(result);
                }
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
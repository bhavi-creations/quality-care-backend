const express = require('express');
const router = express.Router();
const pool = require('../database');

const checkMainCategoryExists = async (mcID) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM categories WHERE id = ?', [mcID], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new subcategory
router.post('/', async (req, res) => {
    try {
        const { mcID, subCategoryName } = req.body;
        const missingFields = {};
        if (!subCategoryName) missingFields.subCategoryName = 'Sub Category Name';
        if (!mcID) missingFields.mcID = 'Main Category Id';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const mainCategoryExists = await checkMainCategoryExists(mcID);
        if (!mainCategoryExists) {
            return res.status(400).json({ message: 'Main Category does not exist' });
        }

        await pool.query('INSERT INTO subcategory (mcID, subCategoryName, status) VALUES (?, ?, 1)',
            [mcID, subCategoryName], function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM subcategory WHERE id = ?', [insertedId], function (selectError, selectResult) {
                        if (selectError) {
                            console.error(selectError.message);
                            res.status(500).json({ message: 'Error fetching inserted data' });
                        } else {
                            // The inserted data is available in selectResult
                            res.json(selectResult[0]);
                        }
                    });
                }
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all subcategory items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM subcategory where status = 1', function (error, result, fields) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            res.json(result);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get all subcategory items
router.get('/getall', async (req, res) => {
    try {
        await pool.query('SELECT * FROM subcategory', function (error, result, fields) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            res.json(result);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a subcategory by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM subcategory WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            res.json(data[0]);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a subcategory
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { subCategoryName, mcID, status } = req.body;
        const missingFields = {};
        if (!subCategoryName) missingFields.subCategoryName = 'Sub Category Name';
        if (!status) missingFields.status = 'Status';
        if (!mcID) missingFields.mcID = 'Main Category Id';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        const mainCategoryExists = await checkMainCategoryExists(mcID);
        if (!mainCategoryExists) {
            return res.status(400).json({ message: 'Main Category does not exist' });
        }

        await pool.query(
            'UPDATE subcategory SET subCategoryName = ?,  mcID = ?, status = ? WHERE id = ?',
            [subCategoryName, mcID, status, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Check if any rows were affected by the update
                    if (result.affectedRows > 0) {
                        // Fetch the updated data using the id
                        pool.query('SELECT * FROM subcategory WHERE id = ?', [id], function (selectError, selectResult) {
                            if (selectError) {
                                console.error(selectError.message);
                                res.status(500).json({ message: 'Error fetching updated data' });
                            } else {
                                // The updated data is available in selectResult
                                res.json(selectResult[0]);
                            }
                        });
                    } else {
                        // If no rows were affected, the record with the given id was not found
                        res.status(404).json({ message: 'Record not found' });
                    }
                }
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a subcategory
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        pool.query('SELECT productImages FROM products WHERE scID = ?', [id], async function (error, oldProduct) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!oldProduct || oldProduct.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            for (product of oldProduct) {
                const oldImageUrls = JSON.parse(product.productImages);
                for (const imageUrl of oldImageUrls) {
                    try {
                        // Delete the file from the uploads folder
                        const filePath = path.join(__dirname, '..', '..', 'public', imageUrl);
                        await fs.promises.unlink(filePath);
                    } catch (error) {
                        console.error('Error deleting file:', error.message);
                    }
                }
            }
        });
        await pool.query('UPDATE products set status = 0 WHERE scID = ?', [id], function (subDeleteError, subDeleteResult) {
            if (subDeleteError) {
                console.error(subDeleteError.message);
                res.status(500).json({ message: 'Error deleting subcategories' });
            } else {
                // Then, delete the category
                pool.query('UPDATE subcategory set status = 0 WHERE id = ?', [id], function (error, result) {
                    if (error) {
                        console.error(error.message);
                        res.status(500).json({ message: 'Internal server error' });
                    } else {
                        // Check if any rows were affected by the delete operation
                        if (result.affectedRows > 0) {
                            res.json({ message: 'subcategory deleted successfully' });
                        } else {
                            // If no rows were affected, the record with the given id was not found
                            res.status(404).json({ message: 'Record not found' });
                        }
                    }
                });
            }
        });


    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

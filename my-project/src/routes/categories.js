const express = require('express');
const router = express.Router();
const pool = require('../database');
const fs = require('fs');
const path = require('path');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        // Generate unique filename and save it in the request object for later use
        req.uploadedFilename = Date.now() + path.extname(file.originalname);
        cb(null, req.uploadedFilename);
    }
});

const upload = multer({ storage: storage });

// Create a new category
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { categoryName, status } = req.body;
        const missingFields = {};
        if (!categoryName) missingFields.categoryName = 'Category Name';
        if (!status) missingFields.status = 'Status';
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        if (!img_url) {
            missingFields.image = 'Image';
        }

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query('INSERT INTO categories (categoryName, status, img_url) VALUES (?, ?, ?)',
            [categoryName, status, img_url], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM categories WHERE id = ?', [insertedId], function (selectError, selectResult) {
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

// Get all categories items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM categories where status = 1', function (error, result, fields) {
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

// Get all categories items
router.get('/getall', async (req, res) => {
    try {
        await pool.query('SELECT * FROM categories', function (error, result, fields) {
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

// Get a categories by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM categories WHERE id = ?', [id], async function (error, data) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            await pool.query('SELECT * FROM subcategory WHERE mcID = ?', [id], function (error, subcategories) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                };
                res.json({ ...data[0], subcategories: subcategories });
            })
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a category
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, status } = req.body;
        const missingFields = {};
        if (!categoryName) missingFields.categoryName = 'Category Name';
        if (!status) missingFields.status = 'Status';
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        let statement = 'UPDATE categories SET categoryName = ?, status = ? WHERE id = ?';
        let values = [categoryName, status, id]


        // If an image is provided, delete the old image associated with the category
        if (img_url) {
            await pool.query('SELECT img_url FROM categories WHERE id = ?', [id], async function (error, oldCategory) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!oldCategory || oldCategory.length === 0) {
                    return res.status(404).json({ message: 'Category not found' });
                }

                try {
                    // Delete the old image file from the uploads folder
                    const filePath = path.join(__dirname, '..', '..', 'public', oldCategory[0].img_url);
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error('Error deleting file:', error.message);
                }
            });
            statement = 'UPDATE categories SET categoryName = ?, status = ?, img_url = ? WHERE id = ?'
            values = [categoryName, status, img_url, id]
        }

        // Update the category with new data
        await pool.query(
            statement,
            values,
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                // Check if any rows were affected by the update
                if (result.affectedRows > 0) {
                    // Fetch the updated data using the id
                    pool.query('SELECT * FROM categories WHERE id = ?', [id], function (selectError, selectResult) {
                        if (selectError) {
                            console.error(selectError.message);
                            return res.status(500).json({ message: 'Error fetching updated data' });
                        }

                        // The updated data is available in selectResult
                        res.json(selectResult[0]);
                    });
                } else {
                    // If no rows were affected, the record with the given id was not found
                    res.status(404).json({ message: 'Record not found' });
                }
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Delete a categories
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        pool.query('SELECT * FROM products WHERE mcID = ?', [id], async function (error, oldProduct) {
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
        pool.query('SELECT img_url FROM categories WHERE id = ?', [id], async function (error, oldProduct) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!oldProduct || oldProduct.length === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }

            try {
                // Delete the file from the uploads folder
                const filePath = path.join(__dirname, '..', '..', 'public', oldProduct.img_url);
                await fs.promises.unlink(filePath);
            } catch (error) {
                console.error('Error deleting file:', error.message);
            }
        });
        // First, delete all subcategories linked to the category
        pool.query('UPDATE products set status = 0 WHERE mcID = ?', [id], function (productDeleteError, productDeleteResult) {
            if (productDeleteError) {
                console.log(productDeleteError)
                console.error(productDeleteError.message);
                res.status(500).json({ message: 'Error deleting products' });
            } else {
                // Now delete the subcategories
                pool.query('UPDATE subcategory set status = 0 WHERE mcID = ?', [id], function (subDeleteError, subDeleteResult) {
                    if (subDeleteError) {
                        console.error(subDeleteError.message);
                        res.status(500).json({ message: 'Error deleting subcategories' });
                    } else {
                        // Then, delete the category
                        pool.query('UPDATE categories set status = 0 WHERE id = ?', [id], function (categoryDeleteError, categoryDeleteResult) {
                            if (categoryDeleteError) {
                                console.error(categoryDeleteError.message);
                                res.status(500).json({ message: 'Internal server error' });
                            } else {
                                // Check if any rows were affected by the delete operation
                                if (categoryDeleteResult.affectedRows > 0) {
                                    res.json({ message: 'Category and associated subcategories deleted successfully' });
                                } else {
                                    // If no rows were affected, the record with the given id was not found
                                    res.status(404).json({ message: 'Record not found' });
                                }
                            }
                        });
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

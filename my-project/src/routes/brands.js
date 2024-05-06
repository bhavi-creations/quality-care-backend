const express = require('express');
const router = express.Router();
const pool = require('../database');

// Create a new brands
router.post('/', async (req, res) => {
    try {
        const { brandName, status } = req.body;
        const missingFields = {};
        if (!brandName) missingFields.brandName = 'Brand Name';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query('INSERT INTO brands (brandName, status) VALUES (?, ?)',
            [brandName, status], function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM brands WHERE id = ?', [insertedId], function (selectError, selectResult) {
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

// Get all brands items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM brands where status = 1', function (error, result, fields) {
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
// Get all brands items
router.get('/getall', async (req, res) => {
    try {
        await pool.query('SELECT * FROM brands', function (error, result, fields) {
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

// Get a brands by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM brands WHERE id = ?', [id], function (error, data) {
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

// Update a brands
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { brandName, status } = req.body;
        const missingFields = {};
        if (!brandName) missingFields.brandName = 'Brand Name';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        await pool.query(
            'UPDATE brands SET brandName = ?, status = ? WHERE id = ?',
            [brandName, status, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Check if any rows were affected by the update
                    if (result.affectedRows > 0) {
                        // Fetch the updated data using the id
                        pool.query('SELECT * FROM brands WHERE id = ?', [id], function (selectError, selectResult) {
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

// Delete a brands
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // First, delete all subbrands linked to the category
        pool.query('DELETE FROM subcategory WHERE mcID = ?', [id], function (subDeleteError, subDeleteResult) {
            if (subDeleteError) {
                console.error(subDeleteError.message);
                res.status(500).json({ message: 'Error deleting subbrands' });
            } else {
                // Then, delete the category
                pool.query('DELETE FROM brands WHERE id = ?', [id], function (categoryDeleteError, categoryDeleteResult) {
                    if (categoryDeleteError) {
                        console.error(categoryDeleteError.message);
                        res.status(500).json({ message: 'Internal server error' });
                    } else {
                        // Check if any rows were affected by the delete operation
                        if (categoryDeleteResult.affectedRows > 0) {
                            res.json({ message: 'Category and associated subbrands deleted successfully' });
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

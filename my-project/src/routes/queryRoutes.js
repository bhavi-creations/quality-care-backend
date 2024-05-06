const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database');

const checkCustomerExists = async (userID) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM customer WHERE id = ?', [userID], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

const checkProductExists = async (productId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM products WHERE ID = ?', [productId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new orders
router.post('/', async (req, res) => {
    try {
        const { userId, question, name, email, productId, type
            // , description
        } = req.body;
        const missingFields = {};
        // if (!userId) missingFields.userId = 'User Id';
        if (!type) missingFields.type = 'Type';
        if (!question) missingFields.question = 'Question';
        // if (!description) missingFields.description = 'Description';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        if (userId) {
            const userExists = await checkCustomerExists(userId);
            if (!userExists) {
                return res.status(400).json({ message: 'User does not exist' });
            }
        }

        // await pool.query('INSERT INTO queries (customerID, question, description) VALUES (?, ?, ?)',
        await pool.query('INSERT INTO queries (customerID, question, customerName, email, productId, type) VALUES (?, ?, ?, ?, ?, ?)',
            // [userId, question, description], async function (error, result) {
            [userId, question, name, email, productId, type], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM queries WHERE id = ?', [insertedId], function (error, data) {
                    if (error) {
                        console.error(error.message);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    if (data.length === 0) {
                        return res.status(404).json({ message: 'Query not found' });
                    }
                    res.json(data[0]);
                });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all orders items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT queries.customerID, customer.*, queries.* FROM queries JOIN customer ON queries.customerID = customer.ID', function (error, result, fields) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(result);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a orders by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM queries WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Query not found' });
            }
            res.json(data[0]);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get the last order of a user by user ID
router.get('/last/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query('SELECT * FROM queries WHERE custoemrID = ? ORDER BY id DESC LIMIT 1', [userId], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.json([{}]);
            }
            // Return the last order of the user
            res.json(data);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get the last order of a user by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query('SELECT * FROM queries WHERE customerID = ?', [userId], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(data);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Update a orders
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, question, description } = req.body;
        const missingFields = {};
        if (!description) missingFields.description = 'Description';
        if (!question) missingFields.question = 'Question';
        if (!userId) missingFields.userId = 'User Id';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query(
            'UPDATE orders SET question = ?, description = ? WHERE id = ?',
            [question, description, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Query updated successfully' });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a orders
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM queries WHERE id = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Query not found' });
            }
            res.json({ message: 'Query deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

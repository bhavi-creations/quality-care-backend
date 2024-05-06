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
                resolve(result[0]);
            }
        });
    });
};

// Create a new orders
router.post('/', async (req, res) => {
    try {
        const { name, address, quantity, paymentType, productId, userId, finalAmount, status } = req.body;
        const missingFields = {};
        if (!address) missingFields.address = 'Address';
        if (!quantity) missingFields.quantity = 'Quantity';
        if (!name) missingFields.name = 'Name';
        if (!paymentType) missingFields.paymentType = 'Payment Type';
        if (!productId) missingFields.productId = 'Product Id';
        if (!userId) missingFields.userId = 'User Id';
        if (!finalAmount) missingFields.finalAmount = 'Final Amount';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const productExists = await checkProductExists(productId);
        if (!productExists) {
            return res.status(400).json({ message: 'Product does not exist' });
        }
        else {
            if (productExists.quantity < quantity) {
                return res.status(400).json({ message: productExists.quantity + ' is not available.' });
            }
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, productId], async function (productError) {
            if (productError) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            await pool.query('INSERT INTO orders (name, address, quantity, paymentType, productID, userID, finalAmount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, address, quantity, paymentType, productId, userId, finalAmount, status], async function (error, result) {
                    if (error) {
                        console.error(error.message);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    const insertedId = result.insertId;
                    await pool.query('SELECT * FROM orders WHERE id = ?', [insertedId], function (error, data) {
                        if (error) {
                            console.error(error.message);
                            return res.status(500).json({ message: 'Internal server error' });
                        }
                        if (data.length === 0) {
                            return res.status(404).json({ message: 'Customer not found' });
                        }
                        res.json(data[0]);
                    });
                });
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all orders items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT orders.userID, orders.productID, customer.*, orders.*, products.* FROM orders JOIN customer ON orders.userID = customer.ID JOIN products ON orders.productID = products.ID;', function (error, result, fields) {
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
        await pool.query('SELECT * FROM orders WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Customer not found' });
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
        await pool.query('SELECT * FROM orders WHERE userID = ? ORDER BY id DESC LIMIT 1', [userId], function (error, data) {
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

        await pool.query('SELECT orders.*, products.*, order.quantity as orderQuntity FROM orders JOIN products ON orders.productID = products.ID WHERE userID = ?', [userId], function (error, data) {
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
        const { name, address, quantity, paymentType, productId, userId, finalAmount, status } = req.body;
        const missingFields = {};
        if (!address) missingFields.address = 'Address';
        if (!quantity) missingFields.quantity = 'Quantity';
        if (!name) missingFields.name = 'Name';
        if (!paymentType) missingFields.paymentType = 'Payment Type';
        if (!productId) missingFields.productId = 'Product Id';
        if (!userId) missingFields.userId = 'User Id';
        if (!finalAmount) missingFields.finalAmount = 'Final Amount';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query(
            // 'UPDATE orders SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE orders SET name = ?,  quantity = ?, address = ?, paymentType = ?, productID = ?, finalAmount = ?, status = ?, userID = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [name, quantity, address, paymentType, productId, finalAmount, status, userId, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Customer updated successfully' });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const missingFields = {};
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query(
            // 'UPDATE orders SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE orders SET status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [status, id], function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Customer not found' });
                }
                res.json({ message: 'Customer deleted successfully' });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a orders
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM orders WHERE id = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.json({ message: 'Customer deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

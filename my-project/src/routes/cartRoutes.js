const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database');

const checkCustomerExists = async (userId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM customer WHERE id = ?', [userId], function (error, result) {
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
        pool.query('SELECT * FROM products WHERE id = ?', [productId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

const checkProductAlreadyInCart = async (productId, userId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM cart WHERE customerID = ? AND productID = ?', [userId, productId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new cart
router.post('/', async (req, res) => {
    try {
        const { productId, userId, status } = req.body;
        const missingFields = {};
        if (!productId) missingFields.productId = 'Product Id';
        if (!status) missingFields.status = 'Status';
        if (!userId) missingFields.userId = 'User Id';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const customerExists = await checkCustomerExists(userId);
        if (!customerExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const productExists = await checkProductExists(productId);
        if (!productExists) {
            return res.status(400).json({ message: 'Product does not exist' });
        }

        const checkIfTheProductAlreadyInCart = await checkProductAlreadyInCart(productId, userId);
        if (checkIfTheProductAlreadyInCart) {
            return res.status(400).json({ message: 'Product already added to cart' });
        }

        await pool.query('INSERT INTO cart (customerID, productID, status) VALUES (?, ?, ?)',
            [userId, productId, status], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM cart WHERE id = ?', [insertedId], function (error, data) {
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
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new cart
router.post('/addcart', async (req, res) => {
    try {
        const { productIds, userId, status } = req.body;
        const missingFields = {};
        if (!productIds && !Array.isArray(productIds)) missingFields.productIds = 'Product Ids';
        if (!status) missingFields.status = 'Status';
        if (!userId) missingFields.userId = 'User Id';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        if (productIds.length === 0) {
            return res.status(400).json({ message: 'Product ID array is empty' });
        }

        const productNotInCart = [];
        for (const id of productIds) {
            const productExists = await checkProductExists(id);
            const alreadyInCart = await checkProductAlreadyInCart(id, userId);
            if (!productExists) {
                // return res.status(400).json({ message: `Product ${id} does not exist` });
            } else if (alreadyInCart) {
                // return res.status(400).json({ message: `Product ${id} is already added to cart` });
            } else {
                productNotInCart.push(id);
            }
        }

        // Insert each product into the cart
        const insertPromises = productNotInCart.map(id => {
            return new Promise((resolve, reject) => {
                pool.query('INSERT INTO cart (customerID, productID, status) VALUES (?, ?, ?)',
                    [userId, id, status], (error, result) => {
                        if (error) {
                            console.error(error.message);
                            reject(error);
                        } else {
                            resolve(result.insertId);
                        }
                    });
            });
        });

        // Execute all insertion queries
        const insertedIds = await Promise.all(insertPromises);

        // Fetch details of the inserted rows and send the response
        const fetchedDataPromises = insertedIds.map(insertedId => {
            return new Promise((resolve, reject) => {
                pool.query('SELECT * FROM cart WHERE id = ?', [insertedId], (error, data) => {
                    if (error) {
                        console.error(error.message);
                        reject(error);
                    } else {
                        resolve(data[0]);
                    }
                });
            });
        });

        const insertedData = await Promise.all(fetchedDataPromises);

        res.json(insertedData);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all cart items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT cart.customerID, cart.productID, customer.*, products.* FROM cart JOIN customer ON cart.customerID = customer.ID JOIN products ON cart.productID = products.ID;', function (error, result, fields) {
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

// Get a cart by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM cart WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            res.json(data[0]);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a cart
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, productId, status } = req.body;
        const missingFields = {};
        if (!productId) missingFields.productId = 'Product Id';
        if (!userId) missingFields.userId = 'User Id';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }


        const customerExists = await checkCustomerExists(userId);
        if (!customerExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const productExists = await checkProductExists(productId);
        if (!productExists) {
            return res.status(400).json({ message: 'Product does not exist' });
        }

        await pool.query(
            // 'UPDATE cart SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE cart SET userID = ?,  productID = ?,  status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [userId, productId, status, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Cart updated successfully' });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get the last order of a user by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query('SELECT cart.customerID, cart.productID, cart.ID as cartID, customer.*, products.*, (products.price * (products.gst / 100)) AS price_with_gst FROM cart JOIN customer ON cart.customerID = customer.ID JOIN products ON cart.productID = products.ID WHERE cart.customerID = ?', [userId], function (error, data) {
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
            // 'UPDATE cart SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE cart SET status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [status, id], function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Cart not found' });
                }
                res.json({ message: 'Cart deleted successfully' });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM cart WHERE ID = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Cart Item not found' });
            }
            res.json({ message: 'Customer deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

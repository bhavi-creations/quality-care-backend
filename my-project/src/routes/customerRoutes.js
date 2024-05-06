const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database');

const checkCustomerExists = async (email) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM customer WHERE email = ?', [email], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new customer
router.post('/', async (req, res) => {
    try {
        const { email, password, name, mobile, status } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!password) missingFields.password = 'Password';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const customerExists = await checkCustomerExists(email);
        if (customerExists) {
            return res.status(400).json({ message: 'User already exist' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('INSERT INTO customer (email, password, fullName, phoneNumber, status) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, name, mobile, status], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM customer WHERE id = ?', [insertedId], function (error, data) {
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

// Get all customer items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM customer', function (error, result, fields) {
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

// Get a customer by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM customer WHERE id = ?', [id], function (error, data) {
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

// Update a customer
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email,
            // password,
            name, mobile, address, status } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!address) missingFields.address = 'Address';
        // if (!password) missingFields.password = 'Password';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        // const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            // 'UPDATE customer SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE customer SET fullName = ?,  email = ?, phoneNumber = ?, status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [name, email, mobile, status, id],
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
            // 'UPDATE customer SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE customer SET status = ? WHERE id = ?',
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

// Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM customer WHERE id = ?', [id], function (error, result) {
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

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch the user record based on the provided email
        pool.query('SELECT * FROM customer WHERE email = ?', [email], async (queryError, queryResult) => {
            if (queryError) {
                console.error(queryError.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            const user = queryResult[0];

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Compare the provided password with the hashed password stored in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Passwords match, login successful
                res.json({ message: 'Login successful', user: user });
            } else {
                // Passwords don't match, return error
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

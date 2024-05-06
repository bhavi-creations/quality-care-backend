const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database');

const checkUserExists = async (email) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM admin_users WHERE email = ?', [email], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new admin_users
router.post('/', async (req, res) => {
    try {
        const { email, password, name, mobile, user_type, status } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!password) missingFields.password = 'Password';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!user_type) missingFields.user_type = 'User Type';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exist' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('INSERT INTO admin_users (email, password, name, mobile, user_type, status, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, name, mobile, user_type, status, JSON.stringify([])], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                // Assuming your table has an auto-increment primary key called 'id'
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM admin_users WHERE id = ?', [insertedId], function (error, data) {
                    if (error) {
                        console.error(error.message);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    if (data.length === 0) {
                        return res.status(404).json({ message: 'Admin user not found' });
                    }
                    res.json(data[0]);
                });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all admin_users items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM admin_users WHERE user_type = "ADMIN" AND status = 1', function (error, result, fields) {
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

router.get('/profile', async (req, res) => {
    try {
        if (req.session.user) {
            let statement = 'SELECT * from admin_users WHERE id = ?';
            let id = req.session.user.ID;
            if (req.session.user?.vendorID) {
                statement = 'SELECT admin_users.*, vendors.* FROM admin_users INNER JOIN vendors ON admin_users.id = vendors.user_id WHERE id = ?';
            }
            await pool.query(statement, [id], function (error, data) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (data.length === 0) {
                    return res.status(404).json({ message: 'Admin user not found' });
                }
                res.json(data[0]);
            });
        }
        else {
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a admin_users by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM admin_users WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Admin user not found' });
            }
            res.json(data[0]);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a admin_users
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, mobile, status } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!status) missingFields.status = 'Status';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        await pool.query(
            'UPDATE admin_users SET name = ?, email = ?, mobile = ?, status = ? WHERE id = ?',
            [name, email, mobile, status, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Admin user not found' });
                }
                res.json({ message: 'Admin user updated successfully' });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a admin_users
router.put('/access/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { accessKeys } = req.body;
        const missingFields = {};
        if (!accessKeys) missingFields.accessKeys = 'Access keys';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        await pool.query(
            'UPDATE admin_users SET permissions = ? WHERE id = ?',
            [JSON.stringify(accessKeys), id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Admin user not found' });
                }
                res.json({ message: 'Admin user updated successfully' });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a admin_users
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM admin_users WHERE id = ?', [id], function (categoryDeleteError, categoryDeleteResult) {
            if (categoryDeleteError) {
                console.error(categoryDeleteError.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (categoryDeleteResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Admin user not found' });
            }
            res.json({ message: 'Admin user deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

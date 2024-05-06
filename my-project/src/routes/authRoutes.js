// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const pool = require('../database'); // Import your database pool or connection

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch the admin user record based on the provided email
        pool.query('SELECT * FROM admin_users WHERE email = ?', [email], async (queryError, queryResult) => {
            if (queryError) {
                return res.status(500).json({ message: 'Internal server error' });
            }

            const user = queryResult[0];

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Compare the provided password with the hashed password stored in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Passwords match, check if the user exists in vendors
                pool.query('SELECT * FROM vendors WHERE user_id = ?', [user.ID], async (vendorQueryError, vendorQueryResult) => {
                    if (vendorQueryError) {
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    const vendor = vendorQueryResult[0];

                    if (vendor) {
                        req.session.user = { ...user, ...vendor };
                    }
                    else {
                        req.session.user = user;
                    }
                    res.json({ message: 'Login successful' });
                });
            } else {
                // Passwords don't match, return error
                res.status(401).json({ message: 'Invalid credentials' });
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    // Destroy user session
    req.session.destroy(err => {
        if (err) {
            res.sendStatus(500);
        } else {
            res.send('Logout successful');
        }
    });
});

module.exports = router;

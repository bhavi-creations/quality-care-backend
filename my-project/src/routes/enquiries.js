// Import nodemailer
const express = require('express');
const router = express.Router();
const pool = require('../database');
const fs = require('fs');
const path = require('path');
const multer = require('multer')
const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'koyiladavignesh@gmail.com',
        pass: 'bofigeusuhftespu'
    }
});

// Define email options
function mailOptions(email) {
    return {
        from: 'earthbased@gmail.com',
        to: email,
        subject: 'Mail from earth based store',
        text: 'Helo User'
    }
};


router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const missingFields = {};
        if (!name) missingFields.name = 'Name';
        if (!message) missingFields.message = 'Message';
        if (!email) missingFields.email = 'Email';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query('INSERT INTO enquiries (name, email, message) VALUES (?, ?, ?)',
            [name, email, message], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM enquiries WHERE id = ?', [insertedId], function (error, data) {
                    // Send email
                    transporter.sendMail(mailOptions(email), function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    if (error) {
                        console.error(error.message);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    if (data.length === 0) {
                        return res.status(404).json({ message: 'Enquiry not found' });
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
        await pool.query('SELECT * FROM enquiries', function (error, result, fields) {
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
        await pool.query('SELECT * FROM enquiries WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Enquiry not found' });
            }
            res.json(data[0]);
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
        const { name, email, message } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!name) missingFields.name = 'Name';
        if (!message) missingFields.message = 'Message';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query(
            // 'UPDATE orders SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE enquiries SET name = ?, email = ?, message = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [name, email, message, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Enquiry updated successfully' });
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

        await pool.query('DELETE FROM enquiries WHERE id = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Enquiry not found' });
            }
            res.json({ message: 'Enquiry deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
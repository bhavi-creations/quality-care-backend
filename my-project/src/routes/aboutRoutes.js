const express = require('express');
const router = express.Router();
const pool = require('../database');

// Create a new about
router.post('/', async (req, res) => {
    try {
        const { ourMission, ourVission, whatsappNo, phoneNumber, address, email } = req.body;
        const missingFields = {};
        if (!ourMission) missingFields.ourMission = 'Our Mission';
        if (!ourVission) missingFields.ourVission = 'Our Vission';
        if (!whatsappNo) missingFields.whatsappNo = 'Whatsapp No';
        if (!phoneNumber) missingFields.phoneNumber = 'Phone Number';
        if (!email) missingFields.email = 'Email';
        if (!address) missingFields.address = 'Address';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query('INSERT INTO about (our_mission, our_vision, whatsapp_no, email, phone_no, address) VALUES (?, ?, ?)',
            [ourMission, ourVission, whatsappNo, phoneNumber, email, address], function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM about WHERE id = ?', [insertedId], function (selectError, selectResult) {
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

// Get all about items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM about', function (error, result, fields) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            res.json(result[0]);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a about by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM about WHERE id = ?', [id], function (error, data) {
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

// Update a about
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ourMission, ourVission, whatsappNo, phoneNumber, address, email } = req.body;
        const missingFields = {};
        if (!ourMission) missingFields.ourMission = 'Our Mission';
        if (!ourVission) missingFields.ourVission = 'Our Vission';
        if (!whatsappNo) missingFields.whatsappNo = 'Whatsapp No';
        if (!phoneNumber) missingFields.phoneNumber = 'Phone Number';
        if (!email) missingFields.email = 'Email';
        if (!address) missingFields.address = 'Address';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        await pool.query(
            'UPDATE about SET our_mission = ?, our_vision = ?, whatsapp_no = ?, phone_no = ?, address = ?, email = ? WHERE id = ?',
            [ourMission, ourVission, whatsappNo, phoneNumber, address, email, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Check if any rows were affected by the update
                    if (result.affectedRows > 0) {
                        // Fetch the updated data using the id
                        pool.query('SELECT * FROM about WHERE id = ?', [id], function (selectError, selectResult) {
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

module.exports = router;

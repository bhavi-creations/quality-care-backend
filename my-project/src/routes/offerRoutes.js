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
        const { offer_path, offer_percentage, is_active } = req.body;
        const missingFields = {};
        if (!offer_path) missingFields.categoryName = 'Offer Type';
        if (!offer_percentage) missingFields.status = 'offer percentage';
        if (!is_active) missingFields.is_active = 'is Active';
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        if (!img_url) {
            missingFields.image = 'Image';
        }

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        // await pool.query('SELECT * FROM standered_offer WHERE is_active = ?;', [1], function (selectError, selectResult) {
        //     if (selectError) {
        //         console.error(selectError.message);
        //         res.status(500).json({ message: 'Error fetching inserted data' });
        //     } else {
        //         if (selectResult.length > 0) {
        //             pool.query('UPDATE standered_offer SET is_active = 0 WHERE is_active = 1;', [offer_path], function (error, result) {
        //                 if (error) {
        //                     console.error(error.message);
        //                 }
        //             });
        //         }
        //     }
        // });

        await pool.query('INSERT INTO standered_offer (offer_path, offer_percentage, is_active, img_url) VALUES (?, ?, ?, ?)',
            [offer_path, offer_percentage, is_active, img_url], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM standered_offer WHERE ID = ?', [insertedId], function (selectError, selectResult) {
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
        await pool.query('SELECT * FROM standered_offer', function (error, result, fields) {
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

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const {  offer_path, offer_percentage, is_active, imagepath } = req.body;
        const missingFields = {};
        if (!offer_path) missingFields.categoryName = 'Offer Type';
        if (!offer_percentage) missingFields.status = 'offer percentage';
        if (!is_active) missingFields.is_active = 'is Active';
        let img_url = imagepath;
        if (!imagepath) {
            img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';
    
            if (!img_url) {
                missingFields.image = 'Image';
            }
        }
        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query(
            'UPDATE standered_offer SET offer_path=?, offer_percentage=?, is_active=?, img_url=? WHERE id = ?',
            [offer_path, offer_percentage, is_active, img_url, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Check if any rows were affected by the update
                    if (result.affectedRows > 0) {
                        // Fetch the updated data using the id
                        pool.query('SELECT * FROM standered_offer WHERE id = ?', [id], function (selectError, selectResult) {
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
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
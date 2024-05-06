// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const router = express.Router();
// const pool = require('../database');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads/'); // Specify the destination folder
//     },
//     filename: function (req, file, cb) {
//         // Generate unique filename and save it in the request object for later use
//         req.uploadedFilename = Date.now() + path.extname(file.originalname);
//         cb(null, req.uploadedFilename);
//     }
// });

// const upload = multer({ storage: storage });

// // Create a new beauty
// router.post('/', upload.single('image'), async (req, res) => {
//     try {
//         const { name, description, price, quantity, rating, type, image } = req.body;
//         const missingFields = {};
//         if (!name) {
//             missingFields.name = 'Name';
//         }
//         if (!description) {
//             missingFields.description = 'Description';
//         }
//         if (!price) {
//             missingFields.price = 'Price';
//         }
//         if (!quantity) {
//             missingFields.quantity = 'Quantity';
//         }
//         if (!rating) {
//             missingFields.rating = 'Rating';
//         }
//         if (!type) {
//             missingFields.type = 'Type';
//         }
//         const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';
//         if (!img_url) {
//             missingFields.image = 'Image';
//         }

//         if (Object.keys(missingFields).length > 0) {
//             return res.status(400).json({ message: 'Missing required fields', missingFields });
//         }
//         const newBeauty = await pool.query('INSERT INTO health1 (name, description, price, quantity, rating, type, img_url, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [name, description, price, quantity, rating, type, img_url, 0]);
//         res.json(newBeauty.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get all beauty items
// router.get('/', async (req, res) => {
//     try {
//         const allUsers = await pool.query('SELECT * FROM health1 ORDER BY id ASC');
//         res.json(allUsers.rows);
//     } catch (error) {
//         console.error('Error fetching data from database:', error.message); // Log error to console
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


// // Get a user by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const user = await pool.query('SELECT * FROM beauty WHERE id = $1', [id]);
//         res.json(user.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Update a user
// router.put('/:id', upload.single('image'), async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, price, quantity, rating, type, img_url } = req.body;
//         const prevImgUrl = img_url;

//         // Delete the previous image from the server
//         if (prevImgUrl) {
//             const prevImgPath = path.join(__dirname, '..', '..', 'public', prevImgUrl);
//             fs.unlinkSync(prevImgPath);
//         }
//         const new_img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';
//         const missingFields = {};
//         if (!name) {
//             missingFields.name = 'Name';
//         }
//         if (!id) {
//             missingFields.name = 'Id';
//         }
//         if (!description) {
//             missingFields.description = 'Description';
//         }
//         if (!price) {
//             missingFields.price = 'Price';
//         }
//         if (!quantity) {
//             missingFields.quantity = 'Quantity';
//         }
//         if (!rating) {
//             missingFields.rating = 'Rating';
//         }
//         if (!type) {
//             missingFields.type = 'Type';
//         }
//         if (!new_img_url) {
//             missingFields.new_img_url = 'Image';
//         }
//         if (Object.keys(missingFields).length > 0) {
//             return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
//         }

//         const updatedBeauty = await pool.query(
//             'UPDATE beauty SET name = $1, description = $2, price = $3, quantity = $4, rating = $5, type = $6, img_url = $7 WHERE id = $8 RETURNING *',
//             [name, description, price, quantity, rating, type, new_img_url, id]
//         );

//         res.json(updatedBeauty.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Delete a user
// router.delete('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         await pool.query('DELETE FROM beauty WHERE id = $1', [id]);
//         res.json({ message: 'User deleted successfully' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// module.exports = router;





// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const router = express.Router();
// const pool = require('../database');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads/'); // Specify the destination folder
//     },
//     filename: function (req, file, cb) {
//         // Generate unique filename and save it in the request object for later use
//         req.uploadedFilename = Date.now() + path.extname(file.originalname);
//         cb(null, req.uploadedFilename);
//     }
// });

// const upload = multer({ storage: storage });

// // Create a new beauty product
// router.post('/', upload.single('image'), async (req, res) => {
//     try {
//         const { name, description, price, quantity, rating, type } = req.body;
//         const missingFields = {};
//         if (!name) missingFields.name = 'Name';
//         if (!description) missingFields.description = 'Description';
//         if (!price) missingFields.price = 'Price';
//         if (!quantity) missingFields.quantity = 'Quantity';
//         if (!rating) missingFields.rating = 'Rating';
//         if (!type) missingFields.type = 'Type';

//         const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';
//         if (!img_url) missingFields.image = 'Image';

//         if (Object.keys(missingFields).length > 0) {
//             return res.status(400).json({ message: 'Missing required fields', missingFields });
//         }

//         const newBeauty = await pool.query('INSERT INTO beauty (name, description, price, quantity, rating, type, img_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [name, description, price, quantity, rating, type, img_url]);
//         res.json(newBeauty.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Get all beauty products
// router.get('/', async (req, res) => {
//     try {
//         const allBeautyProducts = await pool.query('SELECT * FROM health1 ORDER BY id ASC');
//         console.log('Fetched data from database:', allBeautyProducts.rows); // Log fetched data to the console
//         res.json(allBeautyProducts.rows);
//     } catch (error) {
//         console.error('Error fetching data from database:', error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


// // Get a beauty product by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const beautyProduct = await pool.query('SELECT * FROM beauty WHERE id = $1', [id]);
//         res.json(beautyProduct.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Update a beauty product
// router.put('/:id', upload.single('image'), async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, description, price, quantity, rating, type } = req.body;
//         const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

//         const updatedBeautyProduct = await pool.query(
//             'UPDATE beauty SET name = $1, description = $2, price = $3, quantity = $4, rating = $5, type = $6, img_url = $7 WHERE id = $8 RETURNING *',
//             [name, description, price, quantity, rating, type, img_url, id]
//         );

//         res.json(updatedBeautyProduct.rows[0]);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // Delete a beauty product
// router.delete('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         await pool.query('DELETE FROM beauty WHERE id = $1', [id]);
//         res.json({ message: 'Beauty product deleted successfully' });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../database');

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

// Create a new beauty
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, quantity, rating, type } = req.body;
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        const missingFields = {};
        if (!name) missingFields.name = 'Name';
        if (!description) missingFields.description = 'Description';
        if (!price) missingFields.price = 'Price';
        if (!quantity) missingFields.quantity = 'Quantity';
        if (!rating) missingFields.rating = 'Rating';
        if (!type) missingFields.type = 'Type';
        if (!img_url) missingFields.image = 'Image';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        await pool.query('INSERT INTO beauty (name, description, price, quantity, rating, type, img_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
            [name, description, price, quantity, rating, type, img_url], function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM beauty WHERE id = ?', [insertedId], function (selectError, selectResult) {
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

// Get all beauty items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT * FROM beauty', function (error, result, fields) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            res.json(fields);
            return fields;
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a beauty by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM beauty WHERE id = ?', [id], function (error, data) {
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

// Update a beauty
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, quantity, rating, type, img_url } = req.body;
        const new_img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        const missingFields = {};
        if (!name) missingFields.name = 'Name';
        if (!description) missingFields.description = 'Description';
        if (!price) missingFields.price = 'Price';
        if (!quantity) missingFields.quantity = 'Quantity';
        if (!rating) missingFields.rating = 'Rating';
        if (!type) missingFields.type = 'Type';
        if (!new_img_url) missingFields.image = 'Image';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields, data: req.body });
        }

        await pool.query(
            'UPDATE beauty SET name = ?, description = ?, price = ?, quantity = ?, rating = ?, type = ?, img_url = ? WHERE id = ?',
            [name, description, price, quantity, rating, type, new_img_url, id],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Check if any rows were affected by the update
                    if (result.affectedRows > 0) {
                        // Fetch the updated data using the id
                        pool.query('SELECT * FROM beauty WHERE id = ?', [id], function (selectError, selectResult) {
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

// Delete a beauty
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        pool.query('DELETE FROM beauty WHERE id = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            } else {
                // Check if any rows were affected by the delete operation
                if (result.affectedRows > 0) {
                    res.json({ message: 'Beauty deleted successfully' });
                } else {
                    // If no rows were affected, the record with the given id was not found
                    res.status(404).json({ message: 'Record not found' });
                }
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

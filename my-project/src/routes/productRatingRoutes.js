const express = require('express');
const router = express.Router();
const pool = require('../database');
const fs = require('fs');
const path = require('path');
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder for uploads
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename including the field name
        const fieldName = file.fieldname;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        // Save the filename in the request object for later use
        req.uploadedFilenames = req.uploadedFilenames || {};
        req.uploadedFilenames[fieldName] = req.uploadedFilenames[fieldName] || [];
        req.uploadedFilenames[fieldName].push(filename);
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

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

const checkProductAlreadyInRating = async (productId, userId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM ratings WHERE customerID = ? AND productID', [userId, productId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new cart
router.post('/', upload.array('photos[]', 5), async (req, res) => {
    try {
        const { productId, userId, rating, message, customerName } = req.body;
        const missingFields = {};
        if (!productId) missingFields.productId = 'Product Id';
        if (!rating) missingFields.rating = 'Rating';
        if (!message) missingFields.message = 'Message';

        if (userId) {
            const customerExists = await checkCustomerExists(userId);
            if (!customerExists) {
                return res.status(400).json({ message: 'User does not exist' });
            }
        }
        else {
            if (!customerName) missingFields.customerName = 'customerName';
        }
        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        console.log(req.uploadedFilenames)
        let photos = req.uploadedFilenames['photos[]'] ? req.uploadedFilenames['photos[]'].map(filename => 'uploads/' + filename) : [];


        const productExists = await checkProductExists(productId);
        if (!productExists) {
            return res.status(400).json({ message: 'Product does not exist' });
        }

        const checkProductAlreadyInRatingExist = await checkProductAlreadyInRating(productId, userId);
        if (checkProductAlreadyInRatingExist) {
            return res.status(400).json({ message: 'You already rated to this product' });
        }
        let statement = 'INSERT INTO ratings (productID, rating, message, photos'
        let data = [productId, rating, message, JSON.stringify(photos)]
        let values = '?, ?, ?, ?'
        if (userId) {
            statement = statement + ', customerID'
            values = values + ', ?'
            data.push(userId)
        } else {
            statement = statement + ', customerName'
            values = values + ', ?'
            data.push(customerName)
        }
        statement = statement + ') VALUES(' + values + ')'

        await pool.query(statement,
            data, async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                await pool.query('SELECT * FROM ratings WHERE id = ?', [insertedId], function (error, data) {
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

// Get all cart items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT ratings.*, products.*, customer.* FROM ratings JOIN products ON ratings.productID = products.ID LEFT JOIN customer ON ratings.customerID = customer.ID;', function (error, result, fields) {
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

// Get all cart items
router.get('/product/:productId', async (req, res) => {
    try {
        let { productId } = req.params;
        await pool.query('SELECT ratings.*, products.*, customer.* FROM ratings JOIN products ON ratings.productID = products.ID LEFT JOIN customer ON ratings.customerID = customer.ID WHERE productID = ?;', [productId], function (error, result, fields) {
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
        await pool.query('SELECT ratings.customerID, ratings.productID, customer.*, products.* FROM ratings JOIN customer ON ratings.customerID = customer.ID JOIN products ON ratings.productID = products.ID WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Rating not found' });
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
        const { userId, productId, rating } = req.body;
        const missingFields = {};
        if (!productId) missingFields.productId = 'Product Id';
        if (!userId) missingFields.userId = 'User Id';
        if (!rating) missingFields.rating = 'Rating';

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
            'UPDATE ratings SET userID = ?,  productID = ?,  rating = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [userId, productId, rating, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Rating updated successfully' });
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

        await pool.query('SELECT ratings.customerID, ratings.productID, customer.*, products.* FROM ratings JOIN customer ON ratings.customerID = customer.ID JOIN products ON ratings.productID = products.ID WHERE rating.customerID = ?', [userId], function (error, data) {
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

// Delete a cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM rating WHERE id = ?', [id], function (error, result) {
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

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../database');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder for uploads
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename and save it in the request object for later use
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        req.uploadedFilenames = req.uploadedFilenames || [];
        req.uploadedFilenames.push(uniqueSuffix + path.extname(file.originalname));
        cb(null, req.uploadedFilenames[req.uploadedFilenames.length - 1]);
    }
});

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


const deleteUploadedFiles = async (filenames) => {
    if (!filenames || filenames.length === 0) return;
    for (const filename of filenames) {
        try {
            const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);
            await fs.promises.unlink(filePath);
            console.log(`Deleted file: ${filename}`);
        } catch (error) {
            console.error(`Error deleting file ${filename}: ${error.message}`);
        }
    }
};

// Set up multer upload configuration for multiple files
const upload = multer({ storage: storage }).array('images[]', 5); // 'images' is the field name for multiple files, 5 is the maximum number of files allowed

// Create a new product
router.post('/', async (req, res) => {
    try {
        // Upload multiple files
        // upload(req, res, async function (err) {
        //     if (err instanceof multer.MulterError) {
        //         // A Multer error occurred when uploading.
        //         console.error(err.message);
        //         return res.status(500).json({ message: 'Internal server error' });
        //     } else if (err) {
        //         // An unknown error occurred when uploading.
        //         console.error(err.message);
        //         return res.status(500).json({ message: 'Internal server error' });
        //     }

        //     // Process the uploaded files
        //     try {
        const { userId, customerName, comment, type } = req.body;
        const img_urls = req.uploadedFilenames ? req.uploadedFilenames.map(filename => 'uploads/' + filename) : [];

        // Validate required fields
        const missingFields = {};
        if (!comment) missingFields.comment = 'Comment';
        if (!type) missingFields.type = 'Type';
        if (userId) {
            const customerExists = await checkCustomerExists(userId);
            if (!customerExists) {
                return res.status(400).json({ message: 'User does not exist' });
            }
        }
        else {
            if (!customerName) missingFields.customerName = 'customerName';
        }

        // If any required fields are missing, return a 400 error with the missing fields
        if (Object.keys(missingFields).length > 0) {
            await deleteUploadedFiles(req.uploadedFilenames);
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }
        let statement = 'INSERT INTO general_comments (comment, type';
        let data = [comment, type]
        let values = '?, ?'
        if (userId) {
            statement = statement + ', customer_id'
            values = values + ', ?'
            data.push(userId)
        } else {
            statement = statement + ', customer_name'
            values = values + ', ?'
            data.push(customerName)
        }
        statement = statement + ') VALUES(' + values + ')'

        await pool.query(statement,
            data, function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                } else {
                    // Assuming your table has an auto-increment primary key called 'id'
                    const insertedId = result.insertId;

                    // Fetch the inserted data using the insertedId
                    pool.query('SELECT * FROM general_comments WHERE id = ?', [insertedId], function (selectError, selectResult) {
                        if (selectError) {
                            console.error(selectError.message);
                            return res.status(500).json({ message: 'Error fetching inserted data' });
                        } else {
                            // Return the newly inserted product
                            return res.json(selectResult[0]);
                        }
                    });
                }
            });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
    //     });
    // } catch (error) {
    //     console.error(error.message);
    //     return res.status(500).json({ message: 'Internal server error' });
    // }
});

// Get all products items
router.get('/', async (req, res) => {
    try {
        let statement = 'SELECT * FROM general_comments';
        await pool.query(statement, function (error, result, fields) {
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

// Get a products by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT * FROM general_comments WHERE id = ?', [id], function (error, data) {
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

// Get a products by ID
router.get('/getByType/:type', async (req, res) => {
    try {
        const { type } = req.params;
        await pool.query('SELECT * FROM general_comments WHERE type = ?', [type], function (error, data) {
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

// Update a product
router.put('/:id', async (req, res) => {
    // Upload multiple files
    // upload(req, res, async function (err) {
    //     if (err instanceof multer.MulterError) {
    //         // A Multer error occurred when uploading.
    //         console.error(err.message);
    //         return res.status(500).json({ message: 'Internal server error' });
    //     } else if (err) {
    //         // An unknown error occurred when uploading.
    //         console.error(err.message);
    //         return res.status(500).json({ message: 'Internal server error' });
    //     }

    //     try {
    // Process the uploaded files
    const { comment, cutomerName, userId, type } = req.body;
    const { id } = req.params;
    if (userId) {
        const customerExists = await checkCustomerExists(userId);
        if (!customerExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }
    }
    else {
        if (!customerName) missingFields.customerName = 'customerName';
    }

    // const img_urls = req.uploadedFilenames ? req.uploadedFilenames.map(filename => 'uploads/' + filename) : [];
    // console.log(img_urls)

    // Validate required fields
    const missingFields = {};
    if (!comment) missingFields.comment = 'Comment';
    if (!type) missingFields.type = 'type';

    // if (Object.keys(missingFields).length > 0) {
    //     await deleteUploadedFiles(req.uploadedFilenames);
    //     return res.status(400).json({ message: 'Missing required fields', missingFields });
    // }

    // // Check if new images were uploaded
    // if (img_urls.length > 0) {
    //     // Delete old files associated with the product
    //     pool.query('SELECT img_urls FROM general_comments WHERE id = ?', [id], async function (error, oldProduct) {
    //         if (error) {
    //             console.error(error.message);
    //             return res.status(500).json({ message: 'Internal server error' });
    //         }

    //         if (!oldProduct || oldProduct.length === 0) {
    //             return res.status(404).json({ message: 'Product not found' });
    //         }

    //         const oldImageUrls = JSON.parse(oldProduct[0].img_urls);
    //         for (const imageUrl of oldImageUrls) {
    //             try {
    //                 // Delete the file from the uploads folder
    //                 const filePath = path.join(__dirname, '..', '..', 'public', imageUrl);
    //                 await fs.promises.unlink(filePath);
    //             } catch (error) {
    //                 console.error('Error deleting file:', error.message);
    //             }
    //         }
    //     });
    // } else {
    //     // If no new images were uploaded, remove the images field from the update query
    //     delete req.body.productImages;
    // }

    let updateQueryParams = [comment, type];
    let updateQuery = 'UPDATE general_comments SET  comment = ?, type = ?';

    console.log(img_urls.length)
    if (userId) {
        updateQuery += ', customer_id = ?';
        updateQueryParams.push(JSON.stringify(img_urls));
    }
    else {
        updateQuery += ', customer_name= ?';
        updateQueryParams.push(cutomerName);
    }

    updateQuery += ' WHERE id = ?';
    updateQueryParams.push(id);

    console.log(updateQuery, updateQueryParams)

    // Update product information and image URLs in the database
    pool.query(
        updateQuery,
        updateQueryParams,
        async function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            console.log(result)

            // Check if any rows were affected by the update
            if (result.affectedRows > 0) {
                // Fetch the updated data using the id
                pool.query('SELECT * FROM general_comments WHERE id = ?', [id], function (selectError, selectResult) {
                    if (selectError) {
                        console.error(selectError.message);
                        return res.status(500).json({ message: 'Error fetching updated data' });
                    }
                    // The updated data is available in selectResult
                    return res.json(selectResult[0]);
                });
            } else {
                // If no rows were affected, the record with the given id was not found
                return res.status(404).json({ message: 'Record not found' });
            }
        }
    );
    //     } catch (error) {
    //         console.error(error.message);
    //         return res.status(500).json({ message: 'Internal server error' });
    //     }
    // });
});

// Delete a products
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // First, retrieve the product data to get the list of associated image URLs
        // pool.query('SELECT img_urls FROM general_comments WHERE id = ?', [id], async (selectError, productData) => {
        //     if (selectError) {
        //         console.error(selectError.message);
        //         return res.status(500).json({ message: 'Internal server error' });
        //     }

        //     if (!productData || productData.length === 0) {
        //         return res.status(404).json({ message: 'Product not found' });
        //     }

        //     // Parse the product images from the database result
        //     const productImages = JSON.parse(productData[0].productImages);

        //     // Delete the associated files
        //     for (const imageUrl of productImages) {
        //         try {
        //             // Construct the file path
        //             const filePath = path.join(__dirname, '..', '..', 'public', imageUrl);

        //             // Delete the file
        //             await fs.promises.unlink(filePath);
        //         } catch (error) {
        //             console.error('Error deleting file:', error.message);
        //         }
        //     }

        // Once files are deleted, proceed with deleting the product record from the database
        pool.query('DELETE FROM general_comments WHERE id = ?', [id], (deleteError, deleteResult) => {
            if (deleteError) {
                console.error(deleteError.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // Check if any rows were affected by the delete operation
            if (deleteResult.affectedRows > 0) {
                res.json({ message: 'Product and associated files deleted successfully' });
            } else {
                // If no rows were affected, the record with the given id was not found
                res.status(404).json({ message: 'Product not found' });
            }
        });
        // });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;

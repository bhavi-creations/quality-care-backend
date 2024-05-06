const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const pool = require('../database');

 // Route for handling POST requests to add data
// app.post('/addData', (req, res) => {
//     // Extracting data from the request body
//     const {testcode, testName, department, price } = req.body;
  
//     // Query to insert data into the database
//     const sql = `INSERT INTO clinical_bio_chemistry (Test Code, Test Name, Department, Price) VALUES (?, ?, ?, ?)`;
  
//     // Executing the query
//     pool.query(sql, [testcode,  testName, department, price], (err, results) => {
//       if (err) {
//         console.error('Error executing query:', err);
//         return res.status(500).json({ error: 'Internal Server Error' });
//       }
//       console.log('Data added successfully');
//       res.status(200).json({ message: 'Data added successfully' });
//     });
//   });
 
 
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
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                console.error(err.message);
                return res.status(500).json({ message: 'Internal server error' });
            } else if (err) {
                // An unknown error occurred when uploading.
                console.error(err.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            // Process the uploaded files
            try {
                const { code, name, department, price } = req.body;
                const img_urls = req.uploadedFilenames ? req.uploadedFilenames.map(filename => 'uploads/' + filename) : [];

                // Validate required fields
                const missingFields = {};
                if (!code) missingFields.code = 'Code';
                if (!name) missingFields.name = 'Name';
                if (!department) missingFields.department = 'Department';
                if (!price) missingFields.price = 'Price';
 
                // If any required fields are missing, return a 400 error with the missing fields
                if (Object.keys(missingFields).length > 0) {
                    await deleteUploadedFiles(req.uploadedFilenames);
                    return res.status(400).json({ message: 'Missing required fields', missingFields });
                }

                console.log("hi"   )

                await pool.query('INSERT INTO clinical_bio_chemistry (code,name, department,  price   ) VALUES (?, ?, ?, ?  )',
                    [ code, name, department,price ], function (error, result) {
                        if (error) {
                            console.error(error.message);
                            return res.status(500).json({ message: 'Internal server error' });
                        } else {
                            // Assuming your table has an auto-increment primary key called 'id'
                            const insertedId = result.insertId;

                            // Fetch the inserted data using the insertedId
                            pool.query('SELECT * FROM clinical_bio_chemistry WHERE id = ?', [insertedId], function (selectError, selectResult) {
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
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all products items
router.get('/', async (req, res) => {
    try {
        let statement = 'SELECT * FROM clinical_bio_chemistry';
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
        await pool.query('SELECT * FROM clinical_bio_chemistry WHERE id = ?', [id], function (error, data) {
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

// get all top products
router.get('/hot/:type', async (req, res) => {
    try {
        let { type } = req.params;
        const statement = "SELECT * FROM clinical_bio_chemistry where is_hot = ?";
        await pool.query(statement, [type], async function (error, result, fields) {
            if (error) {
                console.error(error.message);
                res.status(500).json({ message: 'Internal server error' });
            };
            for (let product of result) {
                if (product.features) {
                    let featureIds = JSON.parse(product.features);
                    let features = await fetchFeatureData(featureIds);
                    product.featuresData = features;
                }
            }
            res.json(result);
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/hot/updateclinical_bio_chemistry', async (req, res) => {
    const selectedProductIds = req.body;

    try {
        const updateSelectedclinical_bio_chemistrySQL = `UPDATE clinical_bio_chemistry SET is_hot = '1' WHERE id IN (?)`;
        await pool.query(updateSelectedclinical_bio_chemistrySQL, [selectedProductIds]);

        // Update other products in MySQL
        const updateOtherclinical_bio_chemistrySQL = `UPDATE clinical_bio_chemistry SET is_hot = '0' WHERE id NOT IN (?)`;
        await pool.query(updateOtherclinical_bio_chemistrySQL, [selectedProductIds]);

        res.json({ success: true, message: `clinical_bio_chemistry updated successfully.` });
    } catch (error) {
        console.error('Error updating products:', error);
        res.status(500).json({ success: false, message: 'Failed to update products.' });
    }

});

 

// Update a product
router.put('/:id', (req, res) => {
    // Upload multiple files
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error(err.message);
            return res.status(500).json({ message: 'Internal server error' });
        } else if (err) {
            // An unknown error occurred when uploading.
            console.error(err.message);
            return res.status(500).json({ message: 'Internal server error' });
        }

        try {
            // Process the uploaded files
            const { code, name, department, price } = req.body;
            const { id } = req.params;
            const img_urls = req.uploadedFilenames ? req.uploadedFilenames.map(filename => 'uploads/' + filename) : [];
            console.log(img_urls)

            // Validate required fields
            const missingFields = {};
            if (!code) missingFields.code = 'Code';
            if (!name) missingFields.name = 'Name';
            if (!department) missingFields.department = 'Department';
            if (!price) missingFields.price = 'Price';

            if (Object.keys(missingFields).length > 0) {
                await deleteUploadedFiles(req.uploadedFilenames);
                return res.status(400).json({ message: 'Missing required fields', missingFields });
            }

            // Check if new images were uploaded
            if (img_urls.length > 0) {
                // Delete old files associated with the product
                pool.query('SELECT img_urls FROM clinical_bio_chemistry WHERE id = ?', [id], async function (error, oldProduct) {
                    if (error) {
                        console.error(error.message);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    if (!oldProduct || oldProduct.length === 0) {
                        return res.status(404).json({ message: 'Product not found' });
                    }

                    const oldImageUrls = JSON.parse(oldProduct[0].img_urls);
                    for (const imageUrl of oldImageUrls) {
                        try {
                            // Delete the file from the uploads folder
                            const filePath = path.join(__dirname, '..', '..', 'public', imageUrl);
                            await fs.promises.unlink(filePath);
                        } catch (error) {
                            console.error('Error deleting file:', error.message);
                        }
                    }
                });
            } else {
                // If no new images were uploaded, remove the images field from the update query
                delete req.body.productImages;
            }

            let updateQueryParams = [code, name, department, price];
            let updateQuery = 'UPDATE clinical_bio_chemistry SET  code = ?, name = ?, department = ?, price = ?';

            console.log(img_urls.length)
            if (img_urls.length > 0) {
                // If new images were uploaded, include productImages in the update query
                updateQuery += ', img_urls = ?';
                updateQueryParams.push(JSON.stringify(img_urls));
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
                        pool.query('SELECT * FROM clinical_bio_chemistry WHERE id = ?', [id], function (selectError, selectResult) {
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
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Delete a products
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // First, retrieve the product data to get the list of associated image URLs
        pool.query('SELECT img_urls FROM clinical_bio_chemistry WHERE id = ?', [id], async (selectError, productData) => {
            if (selectError) {
                console.error(selectError.message);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!productData || productData.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Parse the product images from the database result
            const productImages = JSON.parse(productData[0].productImages);

            // Delete the associated files
            for (const imageUrl of productImages) {
                try {
                    // Construct the file path
                    const filePath = path.join(__dirname, '..', '..', 'public', imageUrl);

                    // Delete the file
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error('Error deleting file:', error.message);
                }
            }

            // Once files are deleted, proceed with deleting the product record from the database
            pool.query('DELETE FROM clinical_bio_chemistry WHERE id = ?', [id], (deleteError, deleteResult) => {
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
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;


 
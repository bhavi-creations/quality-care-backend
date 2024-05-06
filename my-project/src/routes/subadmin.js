const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const multer = require('multer')
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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        console.log(file.originalname)
        // Generate unique filename and save it in the request object for later use
        req.uploadedFilename = Date.now() + path.extname(file.originalname);
        cb(null, req.uploadedFilename);
    }
});

const upload = multer({ storage: storage });

// Create a new admin_users
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log("bye")
        const { email, password, name, mobile, user_type, address, status, company_ctf_no, company_gst_no, company_name } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!address) missingFields.address = 'Address';
        if (!password) missingFields.password = 'Password';
        if (!company_name) missingFields.company_name = 'Company Name';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!user_type) missingFields.user_type = 'User Type';
        if (!status) missingFields.status = 'Status';
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        if (!img_url) {
            missingFields.image = 'Image';
        }

        if (!company_ctf_no && !company_gst_no) {
            missingFields.ctf_or_reg_no = 'Either company reg number or certificate number is required';
        }

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }


        const userExists = await checkUserExists(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exist' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("hi")

        await pool.query('INSERT INTO admin_users (email, password, name, mobile, user_type, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, name, mobile, user_type, status, JSON.stringify(['products', 'orders', 'enquiries'])], async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                // Assuming your table has an auto-increment primary key called 'id'
                const insertedId = result.insertId;
                let vendorsCreateStatement = 'INSERT INTO vendors (user_id, company_name, img_url, ';
                let valuesString = '?, ?, ?, ';
                let vendorValuesObject = [insertedId, company_name, img_url]
                if (company_ctf_no) {
                    vendorsCreateStatement = vendorsCreateStatement + 'company_ctf_no, ';
                    valuesString = valuesString + '?, '
                    vendorValuesObject.push(company_ctf_no)
                }
                if (company_gst_no) {
                    vendorsCreateStatement = vendorsCreateStatement + 'company_gst_no, ';
                    valuesString = valuesString + '?, '
                    vendorValuesObject.push(company_gst_no)
                }
                valuesString = valuesString + '?)'
                vendorsCreateStatement = vendorsCreateStatement + 'address) VALUES (' + valuesString;
                vendorValuesObject.push(address)
                await pool.query(vendorsCreateStatement,
                    vendorValuesObject, async function (error, result) {
                        if (error) {
                            console.error(error.message);
                            return res.status(500).json({ message: 'Internal server error' });
                        }
                        // Assuming your table has an auto-increment primary key called 'id'
                        const vendorInsertedId = result.insertId;
                        await pool.query('SELECT * FROM vendors WHERE vendorID = ?', [vendorInsertedId], async function (error, data) {
                            if (error) {
                                console.error(error.message);
                                return res.status(500).json({ message: 'Internal server error' });
                            }
                            if (data.length === 0) {
                                return res.status(404).json({ message: 'Admin user not found' });
                            }
                            const vendor = data[0];
                            await pool.query('SELECT * FROM admin_users WHERE id = ?', [insertedId], function (error, data) {
                                if (error) {
                                    console.error(error.message);
                                    return res.status(500).json({ message: 'Internal server error' });
                                }
                                if (data.length === 0) {
                                    return res.status(404).json({ message: 'Admin user not found' });
                                }
                                const adminUser = data[0];
                                res.json({ ...adminUser, ...vendor });
                            });
                        });
                    });
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all orders for the user products
router.get('/orders', async (req, res) => {
    try {
        let sqlStatement = 'SELECT orders.*, products.*, customer.* FROM orders JOIN products ON products.ID = orders.productID JOIN customer ON customer.ID = orders.userID JOIN vendors ON vendors.user_id = products.user_id'
        let object = []
        if (req.session.user?.vendorID) {
            sqlStatement = 'SELECT orders.*, products.* FROM orders JOIN products ON products.ID = orders.productID JOIN vendors ON vendors.user_id = products.user_id WHERE products.user_id = ?;'
            object = [req.session.user?.user_id]
        }
        await pool.query(sqlStatement, object, function (error, result, fields) {
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
})

// Get all admin_users items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT admin_users.*, vendors.* FROM admin_users INNER JOIN vendors ON admin_users.id = vendors.user_id', function (error, result, fields) {
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

// Get a admin_users by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('SELECT admin_users.*, vendors.* FROM admin_users INNER JOIN vendors ON admin_users.id = vendors.user_id WHERE id = ?', [id], function (error, data) {
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
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { email,
            // password,
            name, mobile, user_type, address, status, company_ctf_no, userID, company_gst_no, company_name } = req.body;
        const missingFields = {};
        if (!email) missingFields.email = 'Email';
        if (!userID) missingFields.userID = 'USER ID';
        if (!address) missingFields.address = 'Address';
        // if (!password) missingFields.password = 'Password';
        if (!company_name) missingFields.company_name = 'Company Name';
        if (!name) missingFields.name = 'Name';
        if (!mobile) missingFields.mobile = 'Mobile';
        if (!user_type) missingFields.user_type = 'User Type';
        if (!status) missingFields.status = 'Status';
        const img_url = req.uploadedFilename ? 'uploads/' + req.uploadedFilename : '';

        // If an image is provided, delete the old image associated with the category
        let vendorsCreateStatement = 'UPDATE vendors SET company_name = ?, ';
        let vendorValuesObject = [company_name]
        if (img_url) {
            await pool.query('SELECT img_url FROM vendors WHERE user_id = ?', [userID], async function (error, oldCategory) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!oldCategory || oldCategory.length === 0) {
                    return res.status(404).json({ message: 'Category not found' });
                }

                try {
                    // Delete the old image file from the uploads folder
                    const filePath = path.join(__dirname, '..', '..', 'public', oldCategory[0].img_url);
                    // await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error('Error deleting file:', error.message);
                }
            });
            vendorsCreateStatement = vendorsCreateStatement + 'img_url = ?, '
            vendorValuesObject.push(img_url)
        }

        if (!company_ctf_no && !company_gst_no) {
            missingFields.ctf_or_reg_no = 'Either company reg number or certificate number is required';
        }

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        // const hashedPassword = await bcrypt.hash(password, 10);
        console.log(id)
        await pool.query(
            // 'UPDATE admin_users SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE admin_users SET name = ?,  email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [name, email, mobile, user_type, status, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (company_ctf_no) {
                    vendorsCreateStatement = vendorsCreateStatement + 'company_ctf_no =  ? , ';
                    vendorValuesObject.push(company_ctf_no)
                }
                if (company_gst_no) {
                    vendorsCreateStatement = vendorsCreateStatement + 'company_gst_no = ?, ';
                    vendorValuesObject.push(company_gst_no)
                }
                vendorsCreateStatement = vendorsCreateStatement + 'address = ? WHERE user_id = ?';
                vendorValuesObject.push(address)
                vendorValuesObject.push(userID)
                await pool.query(vendorsCreateStatement,
                    vendorValuesObject, async function (error, result) {
                        if (error) {
                            console.log('vendor')
                            console.error(error.message);
                            return res.status(500).json({ message: 'Internal server error' });
                        }
                        res.json({ message: 'Admin user updated successfully' });
                    }
                );
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
            // 'UPDATE admin_users SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE admin_users SET name = ?,  email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [name, email, mobile, user_type, status, id], function (categoryDeleteError, categoryDeleteResult) {
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

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch the user record based on the provided email
        pool.query('SELECT * FROM admin_users WHERE email = ?', [email], async (queryError, queryResult) => {
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
                res.json({ message: 'Login successful' });
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

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database');

const checkCustomerExists = async (userID) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM customer WHERE id = ?', [userID], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

const checkBlogExists = async (productId) => {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM blogs WHERE is = ?', [productId], function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result.length > 0);
            }
        });
    });
};

// Create a new orders
router.post('/', async (req, res) => {
    try {
        const { blogId, userId, comment, comment_type } = req.body;
        const missingFields = {};
        if (!userId) missingFields.userId = 'User Id';
        if (!blogId) missingFields.blogId = 'Blog Id';
        if (!comment) missingFields.comment = 'Comment';
        if (!comment_type) missingFields.comment_type = 'Type';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const productExists = await checkBlogExists(blogId);
        if (!productExists) {
            return res.status(400).json({ message: 'blog does not exist' });
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query(
            'INSERT INTO comments (blogId, customerID, comment_type, comment) VALUES (?, ?, ?, ?)',
            [blogId, userId, comment_type, comment],
            function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                const insertedId = result.insertId;
                res.status(201).json({ insertedId });
            }
        );

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all orders items
router.get('/', async (req, res) => {
    try {
        await pool.query('SELECT comments.customerID, comments.blogId, customer.*, blogs.*, comments.* FROM comments JOIN customer ON comments.customerID = customer.ID JOIN blogs ON comments.blogId = blogs.ID;', function (error, result, fields) {
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
        await pool.query('SELECT comments.customerID, comments.blogId, customer.*, blogs.*, comments.* FROM comments JOIN customer ON comments.customerID = customer.ID JOIN blogs ON comments.blogId = blogs.ID WHERE id = ?', [id], function (error, data) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (data.length === 0) {
                return res.status(404).json({ message: 'Comment not found' });
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
        const { blogId, userId, comment, comment_type } = req.body;
        const missingFields = {};
        if (!userId) missingFields.userId = 'User Id';
        if (!blogId) missingFields.blogId = 'Blog Id';
        if (!comment) missingFields.comment = 'Comment';
        if (!comment_type) missingFields.comment_type = 'Type';

        if (Object.keys(missingFields).length > 0) {
            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        const userExists = await checkCustomerExists(userId);
        if (!userExists) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        await pool.query(
            // 'UPDATE orders SET name = ?, password = ?, email = ?, mobile = ?, user_type = ?, status = ? WHERE id = ?',
            'UPDATE comments SET comment = ?, comment_type = ?, blogId = ?, WHERE id = ?',
            // [name, hashedPassword, email, mobile, user_type, status, id],
            [comment, comment_type, blogId, id],
            async function (error, result) {
                if (error) {
                    console.error(error.message);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                res.json({ message: 'Comment updated successfully' });
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

        await pool.query('DELETE FROM comments WHERE id = ?', [id], function (error, result) {
            if (error) {
                console.error(error.message);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Comment not found' });
            }
            res.json({ message: 'Comment deleted successfully' });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

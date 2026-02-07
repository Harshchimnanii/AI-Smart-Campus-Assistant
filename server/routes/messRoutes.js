const express = require('express');
const router = express.Router();
const MessMenu = require('../models/MessMenu');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/mess
// @desc    Get mess menu for the week
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const menu = await MessMenu.find({});
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;

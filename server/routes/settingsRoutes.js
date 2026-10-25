const express = require('express');
const router = express.Router();
const { getPublicSettings, getAdminSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getPublicSettings);
router.get('/admin', protect, adminOnly, getAdminSettings);
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;

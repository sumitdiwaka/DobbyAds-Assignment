const express = require('express');
const { getFolders, getFolderById, createFolder, deleteFolder } = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getFolders);
router.get('/:id', protect, getFolderById);
router.post('/', protect, createFolder);
router.delete('/:id', protect, deleteFolder);

module.exports = router;
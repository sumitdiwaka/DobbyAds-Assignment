const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const Folder = require('../models/Folder');

// @GET /api/images?folder=<id>
const getImages = async (req, res) => {
  try {
    const { folder } = req.query;

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: 'Folder ID is required as a query parameter.',
      });
    }

    // Make sure folder belongs to this user
    const folderDoc = await Folder.findOne({ _id: folder, owner: req.user._id });
    if (!folderDoc) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission to view it.',
      });
    }

    const images = await Image.find({ folder, owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: images });
  } catch (err) {
    console.error('GetImages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch images.' });
  }
};

// @POST /api/images
const uploadImage = async (req, res) => {
  try {
    const { name, folder } = req.body;

    if (!name || !name.trim()) {
      // Clean up uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image name is required.',
      });
    }

    if (!folder) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Folder ID is required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    // Validate folder belongs to this user
    const folderDoc = await Folder.findOne({ _id: folder, owner: req.user._id });
    if (!folderDoc) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission to upload here.',
      });
    }

    const image = await Image.create({
      name: name.trim(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: image });
  } catch (err) {
    // Clean up file on DB error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    console.error('UploadImage error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
};

// @DELETE /api/images/:id
const deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, owner: req.user._id });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found or you do not have permission to delete it.',
      });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();

    res.status(200).json({ success: true, message: 'Image deleted successfully.' });
  } catch (err) {
    console.error('DeleteImage error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete image.' });
  }
};

module.exports = { getImages, uploadImage, deleteImage };
const Folder = require('../models/Folder');
const Image = require('../models/Image');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Recursively calculate total size of a folder (all nested images)
const calcFolderSize = async (folderId, ownerId) => {
  const images = await Image.find({ folder: folderId, owner: ownerId });
  let size = images.reduce((sum, img) => sum + img.size, 0);

  const subFolders = await Folder.find({ parent: folderId, owner: ownerId });
  for (const sub of subFolders) {
    size += await calcFolderSize(sub._id, ownerId);
  }
  return size;
};

// Recursively delete a folder and all its nested subfolders + images
const deleteRecursive = async (folderId, ownerId) => {
  const subFolders = await Folder.find({ parent: folderId, owner: ownerId });
  for (const sub of subFolders) {
    await deleteRecursive(sub._id, ownerId);
  }
  await Image.deleteMany({ folder: folderId, owner: ownerId });
  await Folder.findByIdAndDelete(folderId);
};

// ── Controllers ──────────────────────────────────────────────────────────────

// @GET /api/folders?parent=<id|null>
const getFolders = async (req, res) => {
  try {
    const parent =
      !req.query.parent || req.query.parent === 'null'
        ? null
        : req.query.parent;

    const folders = await Folder.find({ owner: req.user._id, parent });

    const foldersWithSize = await Promise.all(
      folders.map(async (f) => {
        const totalSize = await calcFolderSize(f._id, req.user._id);
        return { ...f.toObject(), totalSize };
      })
    );

    res.status(200).json({ success: true, data: foldersWithSize });
  } catch (err) {
    console.error('GetFolders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch folders.' });
  }
};

// @GET /api/folders/:id
const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission to view it.',
      });
    }

    const totalSize = await calcFolderSize(folder._id, req.user._id);

    // Build breadcrumb trail
    const breadcrumb = [];
    let current = folder;
    while (current) {
      breadcrumb.unshift({ _id: current._id, name: current.name });
      if (!current.parent) break;
      current = await Folder.findById(current.parent);
    }

    res.status(200).json({
      success: true,
      data: { ...folder.toObject(), totalSize, breadcrumb },
    });
  } catch (err) {
    console.error('GetFolderById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch folder.' });
  }
};

// @POST /api/folders
const createFolder = async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required.',
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Folder name cannot exceed 100 characters.',
      });
    }

    // Validate parent belongs to this user if provided
    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });
      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found.',
        });
      }
    }

    // Check for duplicate name in same directory
    const duplicate = await Folder.findOne({
      name: name.trim(),
      owner: req.user._id,
      parent: parent || null,
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `A folder named "${name.trim()}" already exists here.`,
      });
    }

    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user._id,
      parent: parent || null,
    });

    res.status(201).json({ success: true, data: { ...folder.toObject(), totalSize: 0 } });
  } catch (err) {
    console.error('CreateFolder error:', err);
    res.status(500).json({ success: false, message: 'Failed to create folder.' });
  }
};

// @DELETE /api/folders/:id
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found or you do not have permission to delete it.',
      });
    }

    await deleteRecursive(folder._id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Folder and all its contents deleted successfully.',
    });
  } catch (err) {
    console.error('DeleteFolder error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete folder.' });
  }
};

module.exports = { getFolders, getFolderById, createFolder, deleteFolder };
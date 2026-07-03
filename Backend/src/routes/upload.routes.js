const crypto = require('crypto');
const path = require('path');
const router = require('express').Router();

const authenticateAdmin = require('../middleware/authenticateAdmin');
const ImageAsset = require('../models/ImageAsset.model');
const ApiResponse = require('../utils/ApiResponse');

const allowedMimeTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

router.post('/image', authenticateAdmin, async (req, res, next) => {
  try {
    const { fileName, mimeType, data } = req.body;

    if (!fileName || !mimeType || !data) {
      return res.status(400).json(ApiResponse.error('Image file is required', 400));
    }

    if (!allowedMimeTypes[mimeType]) {
      return res.status(400).json(ApiResponse.error('Only JPG, PNG, WEBP, and GIF images are allowed', 400));
    }

    const base64Data = String(data).replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const maxSize = 2 * 1024 * 1024;

    if (buffer.length > maxSize) {
      return res.status(400).json(ApiResponse.error('Image must be 2MB or smaller', 400));
    }

    const safeBaseName = path
      .parse(fileName)
      .name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'image';

    const filename = `${safeBaseName}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${allowedMimeTypes[mimeType]}`;

    await ImageAsset.findOneAndUpdate(
      { filename },
      {
        filename,
        originalName: fileName,
        mimeType,
        size: buffer.length,
        data: buffer,
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    const imageUrl = `/uploads/images/${filename}`;

    res.status(201).json(ApiResponse.success({ imageUrl }, 'Image uploaded successfully', 201));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

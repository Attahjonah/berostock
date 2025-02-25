const express = require("express")
const router = express.Router()
const upload = require("../config/multerConfig")
const cloudinary = require("../config/cloudinaryConfig")
const fs = require("fs")

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'uploads' // Optional: Cloudinary folder
      });
  
      // Delete the temporary local file
      fs.unlinkSync(req.file.path);
  
      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url
      });
  
    } catch (error) {
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });
  
  module.exports = router;
  
  
import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Single video upload
router.post('/video', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.status(200).json({
        message: 'Video uploaded successfully',
        url: `/uploads/${req.file.filename}`
    });
});

// Single PDF upload
router.post('/pdf', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.status(200).json({
        message: 'PDF uploaded successfully',
        url: `/uploads/${req.file.filename}`
    });
});

// Single Image upload
router.post('/image', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    res.status(200).json({
        message: 'Image uploaded successfully',
        url: `/uploads/${req.file.filename}`
    });
});

export default router;

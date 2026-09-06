import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, authorize('admin', 'manager'), upload.single('image'), uploadImage);

export default router;

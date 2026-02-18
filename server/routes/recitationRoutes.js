import { Router } from 'express';
import upload from '../middleware/upload.js';
import { analyseRecitation, summaryRecitation } from '../controllers/recitationController.js';

const router = Router();

router.post('/recitation/analyse', upload.single('audio'), analyseRecitation);
router.post('/recitation/summary', summaryRecitation);

export default router;

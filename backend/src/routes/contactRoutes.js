import express from 'express';
import { createContactInquiryHandler } from '../controllers/contactController.js';

const router = express.Router();

/** POST /contact — submit a contact form inquiry */
router.post('/', createContactInquiryHandler);

export default router;

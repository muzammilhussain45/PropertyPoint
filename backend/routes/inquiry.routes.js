import express from 'express';

import {
  sendInquiry,
  getSellerInquiries,
  getBuyerInquiries,
  markAsRead,
} from '../controllers/inquiry.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/', protect, authorize('buyer'), sendInquiry);
inquiryRouter.get('/seller', protect, authorize('seller'), getSellerInquiries);
inquiryRouter.get('/my', protect, authorize('buyer'), getBuyerInquiries);
inquiryRouter.patch('/:id/read', protect, markAsRead);

export default inquiryRouter;
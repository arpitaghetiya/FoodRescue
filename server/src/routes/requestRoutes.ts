import { Router } from 'express';
import {
  createRequest,
  getMyNgoRequests,
  getRequestsForDonor,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { authenticate, authorize, requireVerifiedNgo } from '../middleware/auth.js';

const router = Router();

// NGO submits request (requires verified status)
router.post('/', authenticate, authorize(['NGO']), requireVerifiedNgo, createRequest);

// NGO views their own requests
router.get('/ngo', authenticate, authorize(['NGO']), getMyNgoRequests);

// Donor views requests received for their food donations
router.get('/donor', authenticate, authorize(['DONOR']), getRequestsForDonor);

// Status transition endpoint (approve, reject, collect, complete, etc.)
router.patch('/:id/status', authenticate, updateRequestStatus);

export default router;


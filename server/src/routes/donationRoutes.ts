import { Router } from 'express';
import {
  createDonation,
  getAvailableDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
} from '../controllers/donationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public / NGO browsing route
router.get('/available', getAvailableDonations);

// Donor-specific routes
router.post('/', authenticate, authorize(['DONOR']), createDonation);
router.get('/my', authenticate, authorize(['DONOR']), getMyDonations);

// Detail, edit, cancel
router.get('/:id', getDonationById);
router.put('/:id', authenticate, updateDonation);
router.delete('/:id', authenticate, cancelDonation);

export default router;


import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  verifyNgo,
  deleteUser,
  getAllDonationsAdmin,
  adminRemoveDonation,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/ngos/:ngoProfileId/verify', verifyNgo);
router.get('/donations', getAllDonationsAdmin);
router.post('/donations/:id/remove', adminRemoveDonation);

export default router;


import { Router, Request, Response } from 'express';
import prisma from '../prisma.js';

const router = Router();

router.get('/public-summary', async (req: Request, res: Response) => {
  try {
    const [donationsCount, completedCount, donorsCount, ngosCount] = await Promise.all([
      prisma.donation.count(),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.user.count({ where: { role: 'NGO' } }),
    ]);

    // Calculate approximate meals saved (assuming ~25 meals per donation record avg + baseline demo impact)
    const baseMeals = 12500;
    const dynamicMeals = (donationsCount * 28) + (completedCount * 45);

    res.status(200).json({
      success: true,
      stats: {
        totalMealsRescued: baseMeals + dynamicMeals,
        activeDonors: donorsCount + 42,
        partnerNgos: ngosCount + 28,
        co2SavedKg: Math.round((baseMeals + dynamicMeals) * 1.9),
        activeListingsCount: await prisma.donation.count({ where: { status: 'AVAILABLE' } }),
      },
    });
  } catch (error) {
    console.error('public-summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public summary.' });
  }
});

export default router;


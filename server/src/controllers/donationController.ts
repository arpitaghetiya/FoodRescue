import { Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const donationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  quantityNumeric: z.number().optional().default(1),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  dietaryInfo: z.string().optional(),
  storageRequirement: z.string().optional(),
  preparationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid preparation date',
  }),
  collectionDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid collection deadline',
  }),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  pickupInstructions: z.string().optional(),
  imageUrl: z.string().optional(),
});

// Helper: Auto-update expired listings
const expireOutdatedListings = async () => {
  const now = new Date();
  await prisma.donation.updateMany({
    where: {
      collectionDeadline: { lt: now },
      status: 'AVAILABLE',
    },
    data: {
      status: 'EXPIRED',
    },
  });
};

export const createDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'DONOR') {
      res.status(403).json({ success: false, message: 'Only registered Donors can create food donations.' });
      return;
    }

    const parseResult = donationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
        errors: parseResult.error.errors,
      });
      return;
    }

    const data = parseResult.data;
    const prepDate = new Date(data.preparationDate);
    const deadlineDate = new Date(data.collectionDeadline);
    const now = new Date();

    if (deadlineDate <= now) {
      res.status(400).json({
        success: false,
        message: 'Collection deadline must be in the future.',
      });
      return;
    }

    if (deadlineDate <= prepDate) {
      res.status(400).json({
        success: false,
        message: 'Collection deadline must be after the preparation date.',
      });
      return;
    }

    const donation = await prisma.donation.create({
      data: {
        donorId: req.user.id,
        title: data.title,
        category: data.category,
        quantity: data.quantity,
        quantityNumeric: data.quantityNumeric || 1,
        description: data.description,
        dietaryInfo: data.dietaryInfo || 'Standard Food Safety Compliant',
        storageRequirement: data.storageRequirement || 'Ambient',
        preparationDate: prepDate,
        collectionDeadline: deadlineDate,
        pickupLocation: data.pickupLocation,
        pickupInstructions: data.pickupInstructions || null,
        imageUrl: data.imageUrl || null,
        status: 'AVAILABLE',
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            organization: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DONATION_CREATED',
        details: `Donor "${req.user.name}" created food listing: "${donation.title}" (${donation.quantity})`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Food donation listing created successfully!',
      donation,
    });
  } catch (error) {
    console.error('createDonation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create food donation listing.' });
  }
};

export const getAvailableDonations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await expireOutdatedListings();

    const { search, category, location } = req.query;

    const whereClause: any = {
      status: 'AVAILABLE',
      collectionDeadline: { gt: new Date() },
    };

    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }

    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { pickupLocation: { contains: q } },
      ];
    }

    if (location && String(location).trim() !== '') {
      whereClause.pickupLocation = { contains: String(location).trim() };
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            organization: true,
            address: true,
            phone: true,
          },
        },
        requests: {
          select: {
            id: true,
            ngoId: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error('getAvailableDonations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve available donations.' });
  }
};

export const getMyDonations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'DONOR') {
      res.status(403).json({ success: false, message: 'Only donors can access their listings.' });
      return;
    }

    await expireOutdatedListings();

    const donations = await prisma.donation.findMany({
      where: { donorId: req.user.id },
      include: {
        requests: {
          include: {
            ngo: {
              select: {
                id: true,
                name: true,
                organization: true,
                phone: true,
                email: true,
                ngoProfile: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error('getMyDonations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donor listings.' });
  }
};

export const getDonationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await expireOutdatedListings();

    const { id } = req.params;
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            organization: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        requests: {
          include: {
            ngo: {
              select: {
                id: true,
                name: true,
                organization: true,
                phone: true,
                email: true,
                ngoProfile: true,
              },
            },
          },
        },
      },
    });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation listing not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error('getDonationById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donation details.' });
  }
};

export const updateDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const existing = await prisma.donation.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    if (existing.donorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Unauthorized to modify this donation.' });
      return;
    }

    if (existing.status !== 'AVAILABLE' && req.user.role !== 'ADMIN') {
      res.status(400).json({
        success: false,
        message: `Cannot edit listing when status is "${existing.status}". Only AVAILABLE listings can be edited.`,
      });
      return;
    }

    const parseResult = donationSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
      });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: {
        ...parseResult.data,
        preparationDate: parseResult.data.preparationDate ? new Date(parseResult.data.preparationDate) : undefined,
        collectionDeadline: parseResult.data.collectionDeadline ? new Date(parseResult.data.collectionDeadline) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully.',
      donation: updated,
    });
  } catch (error) {
    console.error('updateDonation error:', error);
    res.status(500).json({ success: false, message: 'Failed to update donation.' });
  }
};

export const cancelDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { requests: true },
    });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation listing not found.' });
      return;
    }

    if (donation.donorId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this listing.' });
      return;
    }

    if (donation.status === 'COMPLETED' || donation.status === 'COLLECTED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a completed or collected donation.' });
      return;
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Mark any pending/approved requests as cancelled
    await prisma.donationRequest.updateMany({
      where: {
        donationId: id,
        status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
      },
      data: {
        status: 'CANCELLED',
        donorResponseNote: 'Donation was cancelled by donor or administrator.',
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DONATION_CANCELLED',
        details: `Donation "${donation.title}" was cancelled by ${req.user.name} (${req.user.role}).`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Donation cancelled successfully.',
      donation: updated,
    });
  } catch (error) {
    console.error('cancelDonation error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel donation.' });
  }
};


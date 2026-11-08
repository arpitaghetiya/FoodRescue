import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { runDatabaseSeed } from '../utils/seedData.js';

export const getAdminStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalNgos,
      verifiedNgos,
      pendingNgos,
      rejectedNgos,
      totalDonations,
      availableDonations,
      completedDonations,
      activeRequests,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'DONOR' } }),
      prisma.user.count({ where: { role: 'NGO' } }),
      prisma.ngoProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.ngoProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.ngoProfile.count({ where: { verificationStatus: 'REJECTED' } }),
      prisma.donation.count(),
      prisma.donation.count({ where: { status: 'AVAILABLE' } }),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.donationRequest.count({ where: { status: 'PENDING' } }),
      prisma.activityLog.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, role: true, email: true },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalNgos,
        verifiedNgos,
        pendingNgos,
        rejectedNgos,
        totalDonations,
        availableDonations,
        completedDonations,
        activeRequests,
      },
      recentActivities,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics.' });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;

    const whereClause: any = {};
    if (role && role !== 'ALL') {
      whereClause.role = String(role);
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      whereClause.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { organization: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        organization: true,
        createdAt: true,
        ngoProfile: true,
        _count: {
          select: {
            donations: true,
            requests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

export const verifyNgo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { ngoProfileId } = req.params;
    const { status, verificationNote } = req.body; // "VERIFIED" or "REJECTED"

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "VERIFIED" or "REJECTED".',
      });
      return;
    }

    const existing = await prisma.ngoProfile.findUnique({
      where: { id: ngoProfileId },
      include: { user: true },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'NGO profile not found.' });
      return;
    }

    const updatedProfile = await prisma.ngoProfile.update({
      where: { id: ngoProfileId },
      data: {
        verificationStatus: status,
        verificationNote: verificationNote || (status === 'VERIFIED' ? 'Verified by administrator.' : 'Rejected upon document review.'),
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: req.user?.name || 'Administrator',
      },
      include: { user: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: status === 'VERIFIED' ? 'NGO_VERIFIED' : 'NGO_REJECTED',
        details: `NGO "${existing.user.organization || existing.user.name}" status changed to ${status} by ${req.user?.name}`,
      },
    });

    res.status(200).json({
      success: true,
      message: `NGO verification status successfully updated to ${status}.`,
      ngoProfile: updatedProfile,
    });
  } catch (error) {
    console.error('verifyNgo error:', error);
    res.status(500).json({ success: false, message: 'Failed to update NGO verification.' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user?.id) {
      res.status(400).json({ success: false, message: 'Administrators cannot delete their own account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'USER_DELETED',
        details: `User "${user.name}" (${user.email}, ${user.role}) was removed by administrator ${req.user?.name}.`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User account removed successfully.',
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

export const getAllDonationsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      whereClause.OR = [
        { title: { contains: q } },
        { pickupLocation: { contains: q } },
        { donor: { name: { contains: q } } },
        { donor: { organization: { contains: q } } },
      ];
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            organization: true,
            email: true,
            phone: true,
          },
        },
        requests: {
          include: {
            ngo: {
              select: {
                id: true,
                name: true,
                organization: true,
                email: true,
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
    console.error('getAllDonationsAdmin error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve donations.' });
  }
};

export const adminRemoveDonation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: { donor: true },
    });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation not found.' });
      return;
    }

    await prisma.donation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.donationRequest.updateMany({
      where: {
        donationId: id,
        status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
      },
      data: {
        status: 'CANCELLED',
        donorResponseNote: `Removed by administrator: ${reason || 'Safety / compliance policy violation'}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'DONATION_REMOVED_BY_ADMIN',
        details: `Donation "${donation.title}" was flagged and cancelled by Admin: ${reason || 'Policy violation'}`,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Donation listing removed successfully.',
    });
  } catch (error) {
    console.error('adminRemoveDonation error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove donation listing.' });
  }
};


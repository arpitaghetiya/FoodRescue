import { Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const requestBodySchema = z.object({
  donationId: z.string().uuid('Invalid donation ID'),
  requestedQuantity: z.string().optional(),
  notes: z.string().optional(),
  pickupDate: z.string().optional(),
});

export const createRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'NGO') {
      res.status(403).json({ success: false, message: 'Only NGO accounts can request food donations.' });
      return;
    }

    // Check verified status
    const ngoProfile = await prisma.ngoProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!ngoProfile || ngoProfile.verificationStatus !== 'VERIFIED') {
      res.status(403).json({
        success: false,
        isUnverifiedNgo: true,
        verificationStatus: ngoProfile?.verificationStatus || 'PENDING',
        message:
          'Your NGO account is currently unverified. Only verified NGOs can request food donations. Please wait for an administrator to review your registration.',
      });
      return;
    }

    const parseResult = requestBodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
      });
      return;
    }

    const { donationId, requestedQuantity, notes, pickupDate } = parseResult.data;

    // Check if donation exists
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { donor: true },
    });

    if (!donation) {
      res.status(404).json({ success: false, message: 'Donation listing not found.' });
      return;
    }

    // Check expiration
    const now = new Date();
    if (new Date(donation.collectionDeadline) <= now) {
      await prisma.donation.update({
        where: { id: donationId },
        data: { status: 'EXPIRED' },
      });
      res.status(400).json({
        success: false,
        message: 'This food donation has expired and is no longer available for redistribution.',
      });
      return;
    }

    // Check if status is available
    if (donation.status !== 'AVAILABLE' && donation.status !== 'REQUESTED') {
      res.status(400).json({
        success: false,
        message: `This donation is no longer available (Current status: ${donation.status}).`,
      });
      return;
    }

    // Check duplicate request from same NGO
    const existingRequest = await prisma.donationRequest.findFirst({
      where: {
        donationId,
        ngoId: req.user.id,
        status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
      },
    });

    if (existingRequest) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted an active request for this donation.',
        existingRequest,
      });
      return;
    }

    // Create donation request
    const donationRequest = await prisma.donationRequest.create({
      data: {
        donationId,
        ngoId: req.user.id,
        requestedQuantity: requestedQuantity || donation.quantity,
        notes: notes || 'Request for community meal distribution',
        pickupScheduledAt: pickupDate ? new Date(pickupDate) : null,
        status: 'PENDING',
      },
      include: {
        donation: true,
        ngo: {
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

    // Update donation status to REQUESTED
    await prisma.donation.update({
      where: { id: donationId },
      data: { status: 'REQUESTED' },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'REQUEST_SUBMITTED',
        details: `NGO "${req.user.organization || req.user.name}" requested food: "${donation.title}"`,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully! The donor has been notified.',
      request: donationRequest,
    });
  } catch (error) {
    console.error('createRequest error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit donation request.' });
  }
};

export const getMyNgoRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'NGO') {
      res.status(403).json({ success: false, message: 'Only NGO users can view their requests.' });
      return;
    }

    const requests = await prisma.donationRequest.findMany({
      where: { ngoId: req.user.id },
      include: {
        donation: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('getMyNgoRequests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch NGO requests.' });
  }
};

export const getRequestsForDonor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'DONOR') {
      res.status(403).json({ success: false, message: 'Only donors can view requests for their donations.' });
      return;
    }

    const requests = await prisma.donationRequest.findMany({
      where: {
        donation: {
          donorId: req.user.id,
        },
      },
      include: {
        donation: true,
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
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('getRequestsForDonor error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch incoming requests.' });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const { action, donorResponseNote, pickupScheduledAt } = req.body;

    const request = await prisma.donationRequest.findUnique({
      where: { id },
      include: {
        donation: true,
        ngo: true,
      },
    });

    if (!request) {
      res.status(404).json({ success: false, message: 'Request not found.' });
      return;
    }

    const isDonor = request.donation.donorId === req.user.id;
    const isNgo = request.ngoId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isDonor && !isNgo && !isAdmin) {
      res.status(403).json({ success: false, message: 'Unauthorized to update this request.' });
      return;
    }

    // Supported actions: "APPROVE", "REJECT", "SCHEDULE_PICKUP", "COLLECT", "COMPLETE", "CANCEL"
    switch (action) {
      case 'APPROVE': {
        if (!isDonor && !isAdmin) {
          res.status(403).json({ success: false, message: 'Only the donor or admin can approve this request.' });
          return;
        }

        const scheduledTime = pickupScheduledAt ? new Date(pickupScheduledAt) : new Date(Date.now() + 3600000 * 2);

        // Update this request to APPROVED / PICKUP_SCHEDULED
        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            donorResponseNote: donorResponseNote || 'Approved for collection. Please follow pickup instructions.',
            pickupScheduledAt: scheduledTime,
          },
        });

        // Update donation status to APPROVED (or PICKUP_SCHEDULED)
        await prisma.donation.update({
          where: { id: request.donationId },
          data: { status: 'APPROVED' },
        });

        // Reject other pending requests for this donation with clear reason
        await prisma.donationRequest.updateMany({
          where: {
            donationId: request.donationId,
            id: { not: id },
            status: 'PENDING',
          },
          data: {
            status: 'REJECTED',
            donorResponseNote: 'Donation allocated to another organization.',
          },
        });

        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'REQUEST_APPROVED',
            details: `Donor approved request for "${request.donation.title}" by ${request.ngo.organization || request.ngo.name}`,
          },
        });

        res.status(200).json({
          success: true,
          message: 'Request approved! Pickup status set to Approved.',
          request: updatedRequest,
        });
        return;
      }

      case 'REJECT': {
        if (!isDonor && !isAdmin) {
          res.status(403).json({ success: false, message: 'Only the donor or admin can reject this request.' });
          return;
        }

        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            donorResponseNote: donorResponseNote || 'Unable to fulfill request at this time.',
          },
        });

        // Check if there are other active requests
        const otherActiveRequests = await prisma.donationRequest.findFirst({
          where: {
            donationId: request.donationId,
            status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
          },
        });

        // If no other active requests, return donation to AVAILABLE
        if (!otherActiveRequests) {
          await prisma.donation.update({
            where: { id: request.donationId },
            data: { status: 'AVAILABLE' },
          });
        }

        res.status(200).json({
          success: true,
          message: 'Request rejected.',
          request: updatedRequest,
        });
        return;
      }

      case 'SCHEDULE_PICKUP': {
        const scheduledTime = pickupScheduledAt ? new Date(pickupScheduledAt) : new Date(Date.now() + 3600000 * 2);

        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: {
            status: 'PICKUP_SCHEDULED',
            pickupScheduledAt: scheduledTime,
            donorResponseNote: donorResponseNote || request.donorResponseNote,
          },
        });

        await prisma.donation.update({
          where: { id: request.donationId },
          data: { status: 'PICKUP_SCHEDULED' },
        });

        res.status(200).json({
          success: true,
          message: 'Pickup scheduled successfully.',
          request: updatedRequest,
        });
        return;
      }

      case 'COLLECT': {
        // Either donor or NGO confirms food has been picked up/collected
        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: {
            status: 'COLLECTED',
            collectedAt: new Date(),
          },
        });

        await prisma.donation.update({
          where: { id: request.donationId },
          data: { status: 'COLLECTED' },
        });

        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'FOOD_COLLECTED',
            details: `Food collection confirmed for "${request.donation.title}" by ${req.user.name}`,
          },
        });

        res.status(200).json({
          success: true,
          message: 'Food collection confirmed.',
          request: updatedRequest,
        });
        return;
      }

      case 'COMPLETE': {
        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        await prisma.donation.update({
          where: { id: request.donationId },
          data: { status: 'COMPLETED' },
        });

        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'DONATION_COMPLETED',
            details: `Donation "${request.donation.title}" successfully completed and verified.`,
          },
        });

        res.status(200).json({
          success: true,
          message: 'Donation cycle completed successfully! Thank you for reducing food waste.',
          request: updatedRequest,
        });
        return;
      }

      case 'CANCEL': {
        if (!isNgo && !isAdmin) {
          res.status(403).json({ success: false, message: 'Only the requesting NGO or admin can cancel this request.' });
          return;
        }

        const updatedRequest = await prisma.donationRequest.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        // Recheck if donation should be restored to AVAILABLE
        const otherActive = await prisma.donationRequest.findFirst({
          where: {
            donationId: request.donationId,
            status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
          },
        });

        if (!otherActive) {
          await prisma.donation.update({
            where: { id: request.donationId },
            data: { status: 'AVAILABLE' },
          });
        }

        res.status(200).json({
          success: true,
          message: 'Request cancelled successfully.',
          request: updatedRequest,
        });
        return;
      }

      default:
        res.status(400).json({
          success: false,
          message: `Unknown action "${action}". Valid actions: APPROVE, REJECT, SCHEDULE_PICKUP, COLLECT, COMPLETE, CANCEL.`,
        });
    }
  } catch (error) {
    console.error('updateRequestStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};


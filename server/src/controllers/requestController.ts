import { Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  validateStatusTransition,
  ConflictError,
  DonationStatus,
} from '../utils/stateMachine.js';

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

    const donationRequest = await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        // 1. Touch/read Donation first
        const donation = await tx.donation.findUnique({
          where: { id: donationId },
          include: { donor: true },
        });

        if (!donation) {
          const err = new Error('Donation listing not found.');
          (err as any).statusCode = 404;
          throw err;
        }

        // 2. Check expiration against consistent transaction clock
        if (new Date(donation.collectionDeadline) <= now) {
          if (donation.status === 'AVAILABLE' || donation.status === 'REQUESTED') {
            await tx.donation.updateMany({
              where: { id: donationId, status: { in: ['AVAILABLE', 'REQUESTED'] } },
              data: { status: 'EXPIRED' },
            });
          }
          const err = new Error('This food donation has expired and is no longer available for redistribution.');
          (err as any).statusCode = 400;
          throw err;
        }

        // 3. Check if status is available or requested
        if (donation.status !== 'AVAILABLE' && donation.status !== 'REQUESTED') {
          const err = new Error(`This donation is no longer available (Current status: ${donation.status}).`);
          (err as any).statusCode = 400;
          throw err;
        }

        // 4. Duplicate request check inside transaction
        const existingRequest = await tx.donationRequest.findFirst({
          where: {
            donationId,
            ngoId: req.user!.id,
            status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
          },
        });

        if (existingRequest) {
          const err = new ConflictError('You have already submitted an active request for this donation.');
          (err as any).existingRequest = existingRequest;
          throw err;
        }

        // 5. Guarded update on Donation (Donation first!)
        const donationUpdate = await tx.donation.updateMany({
          where: {
            id: donationId,
            status: { in: ['AVAILABLE', 'REQUESTED'] },
            collectionDeadline: { gt: now },
          },
          data: { status: 'REQUESTED' },
        });

        if (donationUpdate.count === 0) {
          throw new ConflictError('Donation status changed or expired concurrently.');
        }

        // 6. Create donation request (DonationRequest second)
        const created = await tx.donationRequest.create({
          data: {
            donationId,
            ngoId: req.user!.id,
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

        // 7. Activity log inside transaction
        await tx.activityLog.create({
          data: {
            userId: req.user!.id,
            action: 'REQUEST_SUBMITTED',
            details: `NGO "${req.user!.organization || req.user!.name}" requested food: "${donation.title}"`,
          },
        });

        return created;
      },
      { maxWait: 5000, timeout: 10000 }
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully! The donor has been notified.',
      request: donationRequest,
    });
  } catch (error: any) {
    console.error('createRequest error:', error);
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof ConflictError || error.code === 'P2034') {
      res.status(409).json({
        success: false,
        message: error.message || 'Concurrency conflict occurred. Please retry.',
        existingRequest: error.existingRequest,
      });
      return;
    }
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

    if (!action) {
      res.status(400).json({ success: false, message: 'Action is required.' });
      return;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        const request = await tx.donationRequest.findUnique({
          where: { id },
          include: {
            donation: true,
            ngo: true,
          },
        });

        if (!request) {
          const err = new Error('Request not found.');
          (err as any).statusCode = 404;
          throw err;
        }

        const isDonor = request.donation.donorId === req.user!.id;
        const isNgo = request.ngoId === req.user!.id;
        const isPastDeadline = new Date(request.donation.collectionDeadline) <= now;

        const validation = validateStatusTransition({
          action,
          requestStatus: request.status,
          donationStatus: request.donation.status,
          userRole: req.user!.role,
          isDonor,
          isNgo,
          isPastDeadline,
        });

        if (!validation.allowed) {
          const err = new Error(validation.error || 'Invalid status transition.');
          (err as any).statusCode = validation.statusCode;
          throw err;
        }

        switch (action) {
          case 'APPROVE': {
            const scheduledTime = pickupScheduledAt ? new Date(pickupScheduledAt) : new Date(now.getTime() + 3600000 * 2);

            // Lock & Guard Donation first
            const donationUpdate = await tx.donation.updateMany({
              where: {
                id: request.donationId,
                status: { in: ['AVAILABLE', 'REQUESTED'] },
                collectionDeadline: { gt: now },
              },
              data: { status: 'APPROVED' },
            });

            if (donationUpdate.count === 0) {
              throw new ConflictError('Cannot approve request: donation status changed or deadline passed concurrently.');
            }

            // Update target request second
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: 'PENDING',
              },
              data: {
                status: 'APPROVED',
                donorResponseNote: donorResponseNote || 'Approved for collection. Please follow pickup instructions.',
                pickupScheduledAt: scheduledTime,
              },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot approve request: request status changed concurrently.');
            }

            // Auto-reject competing PENDING requests
            await tx.donationRequest.updateMany({
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

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'REQUEST_APPROVED',
                details: `Donor approved request for "${request.donation.title}" by ${request.ngo.organization || request.ngo.name}`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Request approved! Pickup status set to Approved.',
              request: updatedRequest,
            };
          }

          case 'REJECT': {
            // Target request update
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: 'PENDING',
              },
              data: {
                status: 'REJECTED',
                donorResponseNote: donorResponseNote || 'Unable to fulfill request at this time.',
              },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot reject request: request status changed concurrently.');
            }

            // Check if other active requests remain
            const otherActiveCount = await tx.donationRequest.count({
              where: {
                donationId: request.donationId,
                id: { not: id },
                status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
              },
            });

            if (otherActiveCount === 0) {
              const newStatus: DonationStatus = isPastDeadline ? 'EXPIRED' : 'AVAILABLE';
              await tx.donation.updateMany({
                where: {
                  id: request.donationId,
                  status: { in: ['REQUESTED', 'AVAILABLE'] },
                },
                data: { status: newStatus },
              });
            } else {
              await tx.donation.updateMany({
                where: {
                  id: request.donationId,
                  status: { in: ['REQUESTED', 'AVAILABLE'] },
                },
                data: { status: 'REQUESTED' },
              });
            }

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'REQUEST_REJECTED',
                details: `Donor rejected request for "${request.donation.title}" by ${request.ngo.organization || request.ngo.name}`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Request rejected.',
              request: updatedRequest,
            };
          }

          case 'SCHEDULE_PICKUP': {
            const scheduledTime = pickupScheduledAt ? new Date(pickupScheduledAt) : new Date(now.getTime() + 3600000 * 2);

            // Donation first
            const donationUpdate = await tx.donation.updateMany({
              where: {
                id: request.donationId,
                status: 'APPROVED',
              },
              data: { status: 'PICKUP_SCHEDULED' },
            });

            if (donationUpdate.count === 0) {
              throw new ConflictError('Cannot schedule pickup: donation is no longer in APPROVED status.');
            }

            // Request second
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: 'APPROVED',
              },
              data: {
                status: 'PICKUP_SCHEDULED',
                pickupScheduledAt: scheduledTime,
                donorResponseNote: donorResponseNote || request.donorResponseNote,
              },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot schedule pickup: request is no longer in APPROVED status.');
            }

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'PICKUP_SCHEDULED',
                details: `Pickup scheduled for "${request.donation.title}" with ${request.ngo.organization || request.ngo.name}`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Pickup scheduled successfully.',
              request: updatedRequest,
            };
          }

          case 'COLLECT': {
            // Donation first
            const donationUpdate = await tx.donation.updateMany({
              where: {
                id: request.donationId,
                status: { in: ['APPROVED', 'PICKUP_SCHEDULED'] },
              },
              data: { status: 'COLLECTED' },
            });

            if (donationUpdate.count === 0) {
              throw new ConflictError('Cannot confirm collection: donation status changed concurrently.');
            }

            // Request second
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: { in: ['APPROVED', 'PICKUP_SCHEDULED'] },
              },
              data: {
                status: 'COLLECTED',
                collectedAt: now,
              },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot confirm collection: request status changed concurrently.');
            }

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'FOOD_COLLECTED',
                details: `Food collection confirmed for "${request.donation.title}" by ${req.user!.name}`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Food collection confirmed.',
              request: updatedRequest,
            };
          }

          case 'COMPLETE': {
            // Donation first
            const donationUpdate = await tx.donation.updateMany({
              where: {
                id: request.donationId,
                status: 'COLLECTED',
              },
              data: { status: 'COMPLETED' },
            });

            if (donationUpdate.count === 0) {
              throw new ConflictError('Cannot complete: donation status changed concurrently or is not COLLECTED.');
            }

            // Request second
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: 'COLLECTED',
              },
              data: {
                status: 'COMPLETED',
                completedAt: now,
              },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot complete: request status changed concurrently or is not COLLECTED.');
            }

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'DONATION_COMPLETED',
                details: `Donation "${request.donation.title}" successfully completed and verified.`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Donation cycle completed successfully! Thank you for reducing food waste.',
              request: updatedRequest,
            };
          }

          case 'CANCEL': {
            // Check other active requests
            const otherActiveCount = await tx.donationRequest.count({
              where: {
                donationId: request.donationId,
                id: { not: id },
                status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
              },
            });

            let nextDonationStatus: DonationStatus;
            if (otherActiveCount === 0) {
              nextDonationStatus = isPastDeadline ? 'EXPIRED' : 'AVAILABLE';
            } else {
              nextDonationStatus = 'REQUESTED';
            }

            // Donation first
            const donationUpdate = await tx.donation.updateMany({
              where: {
                id: request.donationId,
                status: { in: ['REQUESTED', 'APPROVED', 'PICKUP_SCHEDULED', 'AVAILABLE'] },
              },
              data: { status: nextDonationStatus },
            });

            if (donationUpdate.count === 0) {
              throw new ConflictError('Cannot cancel request: donation is in a terminal or invalid status.');
            }

            // Request second
            const requestUpdate = await tx.donationRequest.updateMany({
              where: {
                id,
                status: { in: ['PENDING', 'APPROVED', 'PICKUP_SCHEDULED'] },
              },
              data: { status: 'CANCELLED' },
            });

            if (requestUpdate.count === 0) {
              throw new ConflictError('Cannot cancel request: request status changed concurrently.');
            }

            await tx.activityLog.create({
              data: {
                userId: req.user!.id,
                action: 'REQUEST_CANCELLED',
                details: `Request for "${request.donation.title}" was cancelled by ${req.user!.name} (${req.user!.role}).`,
              },
            });

            const updatedRequest = await tx.donationRequest.findUnique({
              where: { id },
              include: { donation: true, ngo: true },
            });

            return {
              message: 'Request cancelled successfully.',
              request: updatedRequest,
            };
          }

          default:
            throw new Error(`Unknown action "${action}".`);
        }
      },
      { maxWait: 5000, timeout: 10000 }
    );

    res.status(200).json({
      success: true,
      message: result.message,
      request: result.request,
    });
  } catch (error: any) {
    console.error('updateRequestStatus error:', error);
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof ConflictError || error.code === 'P2034') {
      res.status(409).json({ success: false, message: error.message || 'Concurrency conflict occurred. Please retry.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to update request status.' });
  }
};


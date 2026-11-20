export type DonationStatus =
  | 'AVAILABLE'
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type DonationRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequestAction =
  | 'APPROVE'
  | 'REJECT'
  | 'SCHEDULE_PICKUP'
  | 'COLLECT'
  | 'COMPLETE'
  | 'CANCEL';

export const ACTIVE_REQUEST_STATUSES: DonationRequestStatus[] = [
  'PENDING',
  'APPROVED',
  'PICKUP_SCHEDULED',
];

export const TERMINAL_REQUEST_STATUSES: DonationRequestStatus[] = [
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
];

export const CANCELLABLE_DONATION_STATUSES: DonationStatus[] = [
  'AVAILABLE',
  'REQUESTED',
  'APPROVED',
  'PICKUP_SCHEDULED',
];

export interface TransitionValidationInput {
  action: RequestAction;
  requestStatus: string;
  donationStatus: string;
  userRole?: string;
  isDonor: boolean;
  isNgo: boolean;
  isPastDeadline: boolean;
}

export interface TransitionValidationResult {
  allowed: boolean;
  statusCode: number;
  error?: string;
  targetRequestStatus?: DonationRequestStatus;
  targetDonationStatus?: DonationStatus;
}

export class ConflictError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * Pure transition validator for request status changes.
 */
export function validateStatusTransition(input: TransitionValidationInput): TransitionValidationResult {
  const { action, requestStatus, donationStatus, userRole, isDonor, isNgo, isPastDeadline } = input;
  const isAdmin = userRole === 'ADMIN';

  // 1. Guard against operations on terminal request statuses
  if (requestStatus === 'REJECTED' || requestStatus === 'CANCELLED' || requestStatus === 'COMPLETED') {
    return {
      allowed: false,
      statusCode: 400,
      error: `Cannot perform action "${action}" on a request with terminal status "${requestStatus}".`,
    };
  }

  // 2. Guard against operations on terminal donation statuses
  if (donationStatus === 'CANCELLED' || donationStatus === 'COMPLETED' || donationStatus === 'EXPIRED') {
    return {
      allowed: false,
      statusCode: 400,
      error: `Cannot perform action "${action}" because donation listing is in terminal status "${donationStatus}".`,
    };
  }

  switch (action) {
    case 'APPROVE': {
      // Role: Only the donor can approve. Admin is explicitly blocked from routine approval.
      if (!isDonor) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the donor can approve this donation request.',
        };
      }

      // Request state check
      if (requestStatus !== 'PENDING') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot approve request with status "${requestStatus}". Only PENDING requests can be approved.`,
        };
      }

      // Donation state check
      if (donationStatus !== 'REQUESTED' && donationStatus !== 'AVAILABLE') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot approve request when donation status is "${donationStatus}". Expected REQUESTED or AVAILABLE.`,
        };
      }

      // Collection deadline check
      if (isPastDeadline) {
        return {
          allowed: false,
          statusCode: 400,
          error: 'Cannot approve request: donation collection deadline has passed.',
        };
      }

      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'APPROVED',
        targetDonationStatus: 'APPROVED',
      };
    }

    case 'REJECT': {
      // Role: Only the donor can reject.
      if (!isDonor) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the donor can reject this donation request.',
        };
      }

      // Request state check
      if (requestStatus !== 'PENDING') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot reject request with status "${requestStatus}". Only PENDING requests can be rejected.`,
        };
      }

      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'REJECTED',
      };
    }

    case 'SCHEDULE_PICKUP': {
      // Role: Only the donor can schedule pickup.
      if (!isDonor) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the donor can schedule pickup for this request.',
        };
      }

      // Request state check
      if (requestStatus !== 'APPROVED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot schedule pickup for request with status "${requestStatus}". Request must be APPROVED.`,
        };
      }

      // Donation state check
      if (donationStatus !== 'APPROVED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot schedule pickup when donation status is "${donationStatus}". Donation must be APPROVED.`,
        };
      }

      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'PICKUP_SCHEDULED',
        targetDonationStatus: 'PICKUP_SCHEDULED',
      };
    }

    case 'COLLECT': {
      // Role: Either donor or approved requesting NGO. Admin blocked from routine collection.
      if (!isDonor && !isNgo) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the donor or approved requesting NGO can confirm food collection.',
        };
      }

      // Request state check: Allowed from APPROVED or PICKUP_SCHEDULED
      if (requestStatus !== 'APPROVED' && requestStatus !== 'PICKUP_SCHEDULED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot confirm collection for request with status "${requestStatus}". Must be APPROVED or PICKUP_SCHEDULED.`,
        };
      }

      // Donation state check: Must be APPROVED or PICKUP_SCHEDULED
      if (donationStatus !== 'APPROVED' && donationStatus !== 'PICKUP_SCHEDULED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot confirm collection when donation status is "${donationStatus}". Must be APPROVED or PICKUP_SCHEDULED.`,
        };
      }

      // Note: Collection is allowed even after deadline if request was already approved.
      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'COLLECTED',
        targetDonationStatus: 'COLLECTED',
      };
    }

    case 'COMPLETE': {
      // Role: Either donor or approved requesting NGO. Admin blocked.
      if (!isDonor && !isNgo) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the donor or approved requesting NGO can confirm completion.',
        };
      }

      // Request state check: Allowed ONLY from COLLECTED
      if (requestStatus !== 'COLLECTED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot complete request with status "${requestStatus}". Request must be COLLECTED first.`,
        };
      }

      // Donation state check: Allowed ONLY from COLLECTED
      if (donationStatus !== 'COLLECTED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot complete donation with status "${donationStatus}". Donation must be COLLECTED first.`,
        };
      }

      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'COMPLETED',
        targetDonationStatus: 'COMPLETED',
      };
    }

    case 'CANCEL': {
      // Role: Requesting NGO or ADMIN
      if (!isNgo && !isAdmin) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'Only the requesting NGO or an administrator can cancel this request.',
        };
      }

      // Request state check: Allowed from PENDING, APPROVED, PICKUP_SCHEDULED
      if (
        requestStatus !== 'PENDING' &&
        requestStatus !== 'APPROVED' &&
        requestStatus !== 'PICKUP_SCHEDULED'
      ) {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot cancel request with status "${requestStatus}". Only active requests can be cancelled.`,
        };
      }

      // Donation state check: Cannot cancel if already COLLECTED or COMPLETED
      if (donationStatus === 'COLLECTED' || donationStatus === 'COMPLETED') {
        return {
          allowed: false,
          statusCode: 400,
          error: `Cannot cancel request because donation is already ${donationStatus}.`,
        };
      }

      return {
        allowed: true,
        statusCode: 200,
        targetRequestStatus: 'CANCELLED',
      };
    }

    default:
      return {
        allowed: false,
        statusCode: 400,
        error: `Unknown action "${action}". Valid actions: APPROVE, REJECT, SCHEDULE_PICKUP, COLLECT, COMPLETE, CANCEL.`,
      };
  }
}

/**
 * Validation helper for cancelling a donation listing.
 */
export function validateDonationCancellation(
  donationStatus: string,
  isDonor: boolean,
  isAdmin: boolean
): { allowed: boolean; statusCode: number; error?: string } {
  if (!isDonor && !isAdmin) {
    return {
      allowed: false,
      statusCode: 403,
      error: 'Not authorized to cancel this donation listing.',
    };
  }

  if (donationStatus === 'COLLECTED' || donationStatus === 'COMPLETED') {
    return {
      allowed: false,
      statusCode: 400,
      error: `Cannot cancel donation with status "${donationStatus}". Food has already been collected or completed.`,
    };
  }

  if (donationStatus === 'CANCELLED' || donationStatus === 'EXPIRED') {
    return {
      allowed: false,
      statusCode: 400,
      error: `Donation listing is already ${donationStatus.toLowerCase()}.`,
    };
  }

  return { allowed: true, statusCode: 200 };
}

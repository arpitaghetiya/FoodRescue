import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token.js';
import prisma from '../prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    organization?: string | null;
    ngoProfile?: {
      id: string;
      verificationStatus: string;
      registrationNumber: string;
    } | null;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        ngoProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or account deactivated.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization,
      ngoProfile: user.ngoProfile
        ? {
            id: user.ngoProfile.id,
            verificationStatus: user.ngoProfile.verificationStatus,
            registrationNumber: user.ngoProfile.registrationNumber,
          }
        : null,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

export const requireVerifiedNgo = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'NGO') {
    res.status(403).json({ success: false, message: 'Action only permitted for NGO accounts.' });
    return;
  }

  if (!req.user.ngoProfile || req.user.ngoProfile.verificationStatus !== 'VERIFIED') {
    res.status(403).json({
      success: false,
      isUnverifiedNgo: true,
      verificationStatus: req.user.ngoProfile?.verificationStatus || 'PENDING',
      message:
        'Your NGO account is currently pending verification or has not been approved by an administrator. Verified status is required to request and claim food donations.',
    });
    return;
  }

  next();
};


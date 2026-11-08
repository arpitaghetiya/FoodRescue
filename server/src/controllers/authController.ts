import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma.js';
import { signToken } from '../utils/token.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['DONOR', 'NGO'], {
    errorMap: () => ({ message: 'Public registration allows only DONOR or NGO accounts' }),
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  organization: z.string().min(2, 'Organization or business name is required'),
  // NGO-specific fields
  registrationNumber: z.string().optional(),
  mission: z.string().optional(),
  operationalAreas: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Validation error',
        errors: parseResult.error.errors,
      });
      return;
    }

    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      organization,
      registrationNumber,
      mission,
      operationalAreas,
    } = parseResult.data;

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    if (role === 'NGO' && (!registrationNumber || registrationNumber.trim().length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Government / Charity registration number is required for NGO accounts.',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        phone: phone || null,
        address: address || null,
        organization: organization || null,
        ...(role === 'NGO'
          ? {
              ngoProfile: {
                create: {
                  registrationNumber: registrationNumber || 'PENDING-REG',
                  mission: mission || 'Food waste redistribution and community relief',
                  operationalAreas: operationalAreas || 'Metropolitan Area',
                  verificationStatus: 'PENDING',
                },
              },
            }
          : {}),
      },
      include: {
        ngoProfile: true,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: `New ${role} registered: ${user.name} (${user.organization || user.email})`,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message:
        role === 'NGO'
          ? 'Registration successful! Your NGO account has been created and is pending administrator verification.'
          : 'Registration successful! Welcome to FoodRescue.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        address: user.address,
        ngoProfile: user.ngoProfile,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: parseResult.error.errors[0]?.message || 'Invalid login details',
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        ngoProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        address: user.address,
        ngoProfile: user.ngoProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        ngoProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
        address: user.address,
        ngoProfile: user.ngoProfile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};


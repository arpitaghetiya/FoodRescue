import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';

/**
 * Bootstraps the initial admin account if no ADMIN user exists in the database.
 * 
 * This runs once on first server cold start (or first Vercel invocation).
 * It is fully idempotent — if an admin already exists, it does nothing.
 * 
 * Requires ADMIN_PASSWORD environment variable in production.
 * Never logs or exposes the password.
 */
export async function bootstrapAdmin(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminPassword = process.env.ADMIN_PASSWORD;

  // In production, ADMIN_PASSWORD is mandatory and must not be the insecure default
  if (isProduction) {
    if (!adminPassword || adminPassword.trim() === '' || adminPassword === 'Admin@123') {
      console.warn(
        '[bootstrap] ADMIN_PASSWORD not set or insecure in production — skipping admin bootstrap. ' +
        'Set a strong ADMIN_PASSWORD environment variable to create the admin account.'
      );
      return;
    }
  }

  const password = adminPassword || 'Admin@123';

  try {
    // Check if ANY admin user already exists — not just the default email
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });

    if (existingAdmin) {
      // Admin already exists, nothing to do
      return;
    }

    // No admin exists — create one
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { email: 'admin@foodrescue.org' },
      update: {},  // If somehow the email exists but isn't ADMIN, don't overwrite
      create: {
        name: 'System Administrator',
        email: 'admin@foodrescue.org',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+91 80 2555 0199',
        address: 'FoodRescue Central HQ, Bengaluru',
        organization: 'FoodRescue Platform Ops',
      },
    });

    console.log('[bootstrap] Admin account created successfully (admin@foodrescue.org)');
  } catch (error) {
    // Log the error but don't crash the server — the app can still serve
    // non-admin routes. Admin can be created later via seed or retry.
    console.error('[bootstrap] Failed to create admin account:', error);
  }
}

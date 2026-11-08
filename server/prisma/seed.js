"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting FoodRescue database seed...');
    // Clean existing records
    await prisma.activityLog.deleteMany();
    await prisma.donationRequest.deleteMany();
    await prisma.donation.deleteMany();
    await prisma.ngoProfile.deleteMany();
    await prisma.user.deleteMany();
    const defaultPassword = await bcryptjs_1.default.hash('Admin@123', 10);
    const donorPassword = await bcryptjs_1.default.hash('Donor@123', 10);
    const ngoPassword = await bcryptjs_1.default.hash('Ngo@123', 10);
    // 1. Seed Administrator
    const admin = await prisma.user.create({
        data: {
            name: 'System Administrator',
            email: 'admin@foodrescue.org',
            password: defaultPassword,
            role: 'ADMIN',
            phone: '+1 (555) 019-2834',
            address: 'FoodRescue Central HQ, 100 Innovation Way',
            organization: 'FoodRescue Platform Ops',
        },
    });
    console.log('✅ Admin user seeded:', admin.email);
    // 2. Seed Donors
    const donor1 = await prisma.user.create({
        data: {
            name: 'Chef Marco Rossi',
            email: 'donor.green@foodrescue.org',
            password: donorPassword,
            role: 'DONOR',
            phone: '+1 (555) 234-5678',
            address: '452 Elm Street, Downtown Dining District',
            organization: 'Green Garden Bistro',
        },
    });
    const donor2 = await prisma.user.create({
        data: {
            name: 'Sarah Jenkins',
            email: 'donor.bake@foodrescue.org',
            password: donorPassword,
            role: 'DONOR',
            phone: '+1 (555) 345-6789',
            address: '88 Baker Avenue, Northside',
            organization: 'Sunrise Artisan Bakery',
        },
    });
    const donor3 = await prisma.user.create({
        data: {
            name: 'David Tanaka',
            email: 'donor.fresh@foodrescue.org',
            password: donorPassword,
            role: 'DONOR',
            phone: '+1 (555) 456-7890',
            address: '1200 Grand Boulevard, City Center',
            organization: 'Metro Grand Hotel & Banquets',
        },
    });
    console.log('✅ Donors seeded');
    // 3. Seed NGOs (Verified and Unverified)
    const ngo1 = await prisma.user.create({
        data: {
            name: 'Elena Rostova',
            email: 'ngo.hope@foodrescue.org',
            password: ngoPassword,
            role: 'NGO',
            phone: '+1 (555) 567-8901',
            address: '312 Compassion Lane, South Quarter',
            organization: 'Hope Haven Community Shelter',
            ngoProfile: {
                create: {
                    registrationNumber: 'NGO-USA-2021-9982',
                    mission: 'Providing nutritious daily meals and shelter for vulnerable community members.',
                    operationalAreas: 'South Quarter, Downtown, Harbor District',
                    verificationStatus: 'VERIFIED',
                    verificationNote: 'Accredited non-profit with verified 501(c)(3) documentation.',
                    verifiedAt: new Date(Date.now() - 30 * 24 * 3600000),
                    verifiedBy: 'System Administrator',
                },
            },
        },
    });
    const ngo2 = await prisma.user.create({
        data: {
            name: 'Marcus Williams',
            email: 'ngo.city@foodrescue.org',
            password: ngoPassword,
            role: 'NGO',
            phone: '+1 (555) 678-9012',
            address: '77 Charity Way, East Valley',
            organization: 'City Care Food Bank',
            ngoProfile: {
                create: {
                    registrationNumber: 'NGO-USA-2019-4412',
                    mission: 'Distributing emergency food parcels and surplus meals to low-income families.',
                    operationalAreas: 'East Valley, Midtown, University Border',
                    verificationStatus: 'VERIFIED',
                    verificationNote: 'Verified regional food bank partner.',
                    verifiedAt: new Date(Date.now() - 60 * 24 * 3600000),
                    verifiedBy: 'System Administrator',
                },
            },
        },
    });
    const ngoUnverified = await prisma.user.create({
        data: {
            name: 'Amina Patel',
            email: 'ngo.new@foodrescue.org',
            password: ngoPassword,
            role: 'NGO',
            phone: '+1 (555) 789-0123',
            address: '15 Hope Terrace, Westside',
            organization: 'New Dawn Relief Foundation',
            ngoProfile: {
                create: {
                    registrationNumber: 'NGO-PENDING-2026-004',
                    mission: 'Youth and community nutritional support and weekend food drives.',
                    operationalAreas: 'Westside Suburbs',
                    verificationStatus: 'PENDING',
                    verificationNote: 'Pending board certificate review by administrator.',
                },
            },
        },
    });
    console.log('✅ NGOs seeded (2 verified, 1 pending verification)');
    // 4. Seed Donations
    const now = new Date();
    // Donation 1: Available Cooked Meals
    const donation1 = await prisma.donation.create({
        data: {
            donorId: donor1.id,
            title: '50 Servings Fresh Vegetable Biryani & Raita',
            category: 'Cooked Meals',
            quantity: '50 Meal Containers',
            quantityNumeric: 50,
            description: 'Prepared for a corporate luncheon today at 1 PM. Packed in food-grade insulated catering containers, hot-held safely at 65°C.',
            dietaryInfo: 'Vegetarian, Halal certified, Contains Dairy',
            storageRequirement: 'Keep Hot (>60°C) or Refrigerate immediately',
            preparationDate: new Date(now.getTime() - 2 * 3600000),
            collectionDeadline: new Date(now.getTime() + 6 * 3600000),
            pickupLocation: '452 Elm Street, Downtown Dining District (Rear Kitchen Door)',
            pickupInstructions: 'Ring doorbell at kitchen entrance; ask for Chef Marco or duty manager.',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        },
    });
    // Donation 2: Available Fresh Artisan Bakery
    const donation2 = await prisma.donation.create({
        data: {
            donorId: donor2.id,
            title: '35 Loaves Artisan Sourdough & Croissants',
            category: 'Bakery & Bread',
            quantity: '35 Assorted Loaves & Pastries',
            quantityNumeric: 35,
            description: 'Baked fresh this morning. Includes whole-wheat sourdough, rustic baguettes, and butter croissants. Excellent for distribution.',
            dietaryInfo: 'Vegetarian, Contains Gluten',
            storageRequirement: 'Room Temperature / Dry',
            preparationDate: new Date(now.getTime() - 5 * 3600000),
            collectionDeadline: new Date(now.getTime() + 18 * 3600000),
            pickupLocation: '88 Baker Avenue, Northside',
            pickupInstructions: 'Store counter staff will have bagged boxes ready for collection.',
            status: 'AVAILABLE',
            imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        },
    });
    // Donation 3: Requested Donation
    const donation3 = await prisma.donation.create({
        data: {
            donorId: donor3.id,
            title: '60 Portions Grilled Herb Chicken & Roasted Potatoes',
            category: 'Cooked Meals',
            quantity: '60 Banquet Portions',
            quantityNumeric: 60,
            description: 'Surplus executive banquet servings. Kept in hot-cabinets under strict HACCP food safety standards.',
            dietaryInfo: 'High-Protein, Gluten-Free, Halal',
            storageRequirement: 'Refrigerated or Heated',
            preparationDate: new Date(now.getTime() - 3 * 3600000),
            collectionDeadline: new Date(now.getTime() + 5 * 3600000),
            pickupLocation: '1200 Grand Boulevard, Loading Dock B',
            pickupInstructions: 'Security gate will grant access to FoodRescue authorized vehicles.',
            status: 'REQUESTED',
            imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
        },
    });
    // Request for Donation 3
    await prisma.donationRequest.create({
        data: {
            donationId: donation3.id,
            ngoId: ngo1.id,
            requestedQuantity: '60 Banquet Portions',
            notes: 'Urgent need for dinner service tonight at the community emergency shelter.',
            status: 'PENDING',
        },
    });
    // Donation 4: Pickup Scheduled
    const donation4 = await prisma.donation.create({
        data: {
            donorId: donor1.id,
            title: '30 kg Fresh Seasonal Produce (Apples, Carrots, Oranges)',
            category: 'Produce & Fruits',
            quantity: '30 kg in 3 crates',
            quantityNumeric: 30,
            description: 'Crisp organic gala apples, farm carrots, and sweet valencia oranges from weekly surplus market stock.',
            dietaryInfo: '100% Vegan, Organic, Raw',
            storageRequirement: 'Cool dry area',
            preparationDate: new Date(now.getTime() - 24 * 3600000),
            collectionDeadline: new Date(now.getTime() + 24 * 3600000),
            pickupLocation: '452 Elm Street, Downtown Dining District',
            pickupInstructions: 'Park in front loading zone with hazard lights.',
            status: 'PICKUP_SCHEDULED',
            imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
        },
    });
    // Request for Donation 4 (Approved & Scheduled)
    await prisma.donationRequest.create({
        data: {
            donationId: donation4.id,
            ngoId: ngo2.id,
            requestedQuantity: '30 kg in 3 crates',
            notes: 'To be added to weekend family grocery parcels for 40 local households.',
            status: 'APPROVED',
            donorResponseNote: 'Approved! We have loaded crates onto pallets at the rear ramp.',
            pickupScheduledAt: new Date(now.getTime() + 2 * 3600000),
        },
    });
    // Donation 5: Completed
    const donation5 = await prisma.donation.create({
        data: {
            donorId: donor2.id,
            title: '40 Sandwiches & Healthy Grain Salads',
            category: 'Cooked Meals',
            quantity: '40 Individual Packs',
            quantityNumeric: 40,
            description: 'Individually wrapped gourmet turkey & veggie sandwiches with Mediterranean quinoa salads.',
            dietaryInfo: 'Mixed dietary choices, Nut-free',
            storageRequirement: 'Chilled (<4°C)',
            preparationDate: new Date(now.getTime() - 48 * 3600000),
            collectionDeadline: new Date(now.getTime() - 24 * 3600000),
            pickupLocation: '88 Baker Avenue, Northside',
            status: 'COMPLETED',
            imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        },
    });
    await prisma.donationRequest.create({
        data: {
            donationId: donation5.id,
            ngoId: ngo1.id,
            requestedQuantity: '40 Individual Packs',
            notes: 'Directly distributed to unhoused community members during evening outreach.',
            status: 'COMPLETED',
            donorResponseNote: 'Thank you for your tireless community work!',
            pickupScheduledAt: new Date(now.getTime() - 36 * 3600000),
            collectedAt: new Date(now.getTime() - 34 * 3600000),
            completedAt: new Date(now.getTime() - 30 * 3600000),
        },
    });
    // Seed initial activity logs
    await prisma.activityLog.createMany({
        data: [
            {
                userId: admin.id,
                action: 'SYSTEM_INITIALIZED',
                details: 'FoodRescue smart redistribution platform initialized successfully.',
            },
            {
                userId: donor1.id,
                action: 'DONATION_CREATED',
                details: 'Green Garden Bistro posted "50 Servings Fresh Vegetable Biryani & Raita".',
            },
            {
                userId: ngo1.id,
                action: 'REQUEST_SUBMITTED',
                details: 'Hope Haven Community Shelter submitted request for "60 Portions Grilled Herb Chicken".',
            },
            {
                userId: admin.id,
                action: 'NGO_VERIFIED',
                details: 'City Care Food Bank verification approved by Administrator.',
            },
        ],
    });
    console.log('✅ Seed completed successfully with demo users, donations, and workflow records!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

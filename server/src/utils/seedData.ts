import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function runDatabaseSeed(prisma: PrismaClient) {
  const isProduction = process.env.NODE_ENV === 'production';
  let adminPlainPassword = process.env.ADMIN_PASSWORD;

  if (isProduction) {
    if (!adminPlainPassword || adminPlainPassword.trim() === '' || adminPlainPassword === 'Admin@123') {
      throw new Error(
        'CRITICAL SECURITY CONFIGURATION ERROR: A custom ADMIN_PASSWORD environment variable is required in production. Default password "Admin@123" is forbidden.'
      );
    }
  } else {
    adminPlainPassword = adminPlainPassword || 'Admin@123';
  }

  const defaultPassword = await bcrypt.hash(adminPlainPassword, 10);
  const donorPassword = await bcrypt.hash('Donor@123', 10);
  const ngoPassword = await bcrypt.hash('Ngo@123', 10);

  // 1. Seed or Upsert Administrator
  const admin = await prisma.user.upsert({
    where: { email: 'admin@foodrescue.org' },
    update: {
      name: 'System Administrator',
      role: 'ADMIN',
      phone: '+91 80 2555 0199',
      address: 'FoodRescue Central HQ, Bengaluru',
      organization: 'FoodRescue Platform Ops',
    },
    create: {
      name: 'System Administrator',
      email: 'admin@foodrescue.org',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '+91 80 2555 0199',
      address: 'FoodRescue Central HQ, Bengaluru',
      organization: 'FoodRescue Platform Ops',
    },
  });

  // 2. Seed or Upsert Donors
  const donor1 = await prisma.user.upsert({
    where: { email: 'donor.green@foodrescue.org' },
    update: {
      name: 'Chef Marco Rossi',
      organization: 'Green Garden Bistro',
      phone: '+91 80 2345 6789',
      address: '452 Elm Street, Downtown Dining District, Bengaluru',
    },
    create: {
      name: 'Chef Marco Rossi',
      email: 'donor.green@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 2345 6789',
      address: '452 Elm Street, Downtown Dining District, Bengaluru',
      organization: 'Green Garden Bistro',
    },
  });

  const donor2 = await prisma.user.upsert({
    where: { email: 'donor.bake@foodrescue.org' },
    update: {
      name: 'Sarah Jenkins',
      organization: 'Sunrise Artisan Bakery',
      phone: '+91 80 3456 7890',
      address: '88 Baker Avenue, Northside, Bengaluru',
    },
    create: {
      name: 'Sarah Jenkins',
      email: 'donor.bake@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 3456 7890',
      address: '88 Baker Avenue, Northside, Bengaluru',
      organization: 'Sunrise Artisan Bakery',
    },
  });

  const donor3 = await prisma.user.upsert({
    where: { email: 'donor.fresh@foodrescue.org' },
    update: {
      name: 'David Tanaka',
      organization: 'Metro Grand Hotel & Banquets',
      phone: '+91 80 4567 8901',
      address: '1200 Grand Boulevard, City Center, Bengaluru',
    },
    create: {
      name: 'David Tanaka',
      email: 'donor.fresh@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 4567 8901',
      address: '1200 Grand Boulevard, City Center, Bengaluru',
      organization: 'Metro Grand Hotel & Banquets',
    },
  });

  const donorAnnapurna = await prisma.user.upsert({
    where: { email: 'donor.annapurna@foodrescue.org' },
    update: {
      name: 'Ramesh Iyer',
      organization: 'Annapurna Bhavan Traditional Foods',
      phone: '+91 80 5678 9012',
      address: '12 Temple Road, Indiranagar, Bengaluru',
    },
    create: {
      name: 'Ramesh Iyer',
      email: 'donor.annapurna@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 5678 9012',
      address: '12 Temple Road, Indiranagar, Bengaluru',
      organization: 'Annapurna Bhavan Traditional Foods',
    },
  });

  const donorSpice = await prisma.user.upsert({
    where: { email: 'donor.spice@foodrescue.org' },
    update: {
      name: 'Priya Sundaram',
      organization: 'Royal Spice Caterers & Events',
      phone: '+91 80 6789 0123',
      address: '45 Brigade Road, Central District, Bengaluru',
    },
    create: {
      name: 'Priya Sundaram',
      email: 'donor.spice@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 6789 0123',
      address: '45 Brigade Road, Central District, Bengaluru',
      organization: 'Royal Spice Caterers & Events',
    },
  });

  const donorDairy = await prisma.user.upsert({
    where: { email: 'donor.dairy@foodrescue.org' },
    update: {
      name: 'Anil Verma',
      organization: 'Fresh Farms Supermarket & Dairy',
      phone: '+91 80 7890 1234',
      address: '78 MG Road, Commercial Zone, Bengaluru',
    },
    create: {
      name: 'Anil Verma',
      email: 'donor.dairy@foodrescue.org',
      password: donorPassword,
      role: 'DONOR',
      phone: '+91 80 7890 1234',
      address: '78 MG Road, Commercial Zone, Bengaluru',
      organization: 'Fresh Farms Supermarket & Dairy',
    },
  });

  // 3. Seed or Upsert NGOs
  const ngo1 = await prisma.user.upsert({
    where: { email: 'ngo.hope@foodrescue.org' },
    update: {
      name: 'Elena Rostova',
      organization: 'Hope Haven Community Shelter',
      phone: '+91 80 8901 2345',
      address: '312 Compassion Lane, South Quarter, Bengaluru',
    },
    create: {
      name: 'Elena Rostova',
      email: 'ngo.hope@foodrescue.org',
      password: ngoPassword,
      role: 'NGO',
      phone: '+91 80 8901 2345',
      address: '312 Compassion Lane, South Quarter, Bengaluru',
      organization: 'Hope Haven Community Shelter',
    },
  });

  await prisma.ngoProfile.upsert({
    where: { userId: ngo1.id },
    update: {
      verificationStatus: 'VERIFIED',
      verifiedBy: 'System Administrator',
      verifiedAt: new Date(),
    },
    create: {
      userId: ngo1.id,
      registrationNumber: 'NGO-IND-2021-9982',
      mission: 'Providing nutritious daily meals and shelter for vulnerable community members.',
      operationalAreas: 'South Quarter, Indiranagar, City Center',
      verificationStatus: 'VERIFIED',
      verificationNote: 'Verified non-profit charity documentation.',
      verifiedAt: new Date(),
      verifiedBy: 'System Administrator',
    },
  });

  const ngo2 = await prisma.user.upsert({
    where: { email: 'ngo.city@foodrescue.org' },
    update: {
      name: 'Marcus Williams',
      organization: 'City Care Food Bank',
      phone: '+91 80 9012 3456',
      address: '77 Charity Way, East Valley, Bengaluru',
    },
    create: {
      name: 'Marcus Williams',
      email: 'ngo.city@foodrescue.org',
      password: ngoPassword,
      role: 'NGO',
      phone: '+91 80 9012 3456',
      address: '77 Charity Way, East Valley, Bengaluru',
      organization: 'City Care Food Bank',
    },
  });

  await prisma.ngoProfile.upsert({
    where: { userId: ngo2.id },
    update: {
      verificationStatus: 'VERIFIED',
      verifiedBy: 'System Administrator',
    },
    create: {
      userId: ngo2.id,
      registrationNumber: 'NGO-IND-2019-4412',
      mission: 'Distributing emergency food parcels and surplus meals to low-income households.',
      operationalAreas: 'East Valley, Koramangala',
      verificationStatus: 'VERIFIED',
      verificationNote: 'Verified community food distribution network.',
      verifiedAt: new Date(),
      verifiedBy: 'System Administrator',
    },
  });

  const ngoUnverified = await prisma.user.upsert({
    where: { email: 'ngo.new@foodrescue.org' },
    update: {
      name: 'Amina Patel',
      organization: 'New Dawn Relief Foundation',
      phone: '+91 80 1234 5678',
      address: '15 Hope Terrace, Westside, Bengaluru',
    },
    create: {
      name: 'Amina Patel',
      email: 'ngo.new@foodrescue.org',
      password: ngoPassword,
      role: 'NGO',
      phone: '+91 80 1234 5678',
      address: '15 Hope Terrace, Westside, Bengaluru',
      organization: 'New Dawn Relief Foundation',
    },
  });

  // Always reset unverified NGO to PENDING during seed so test suite can verify it
  await prisma.ngoProfile.upsert({
    where: { userId: ngoUnverified.id },
    update: {
      verificationStatus: 'PENDING',
      verificationNote: 'Registration document pending administrator audit.',
      verifiedAt: null,
      verifiedBy: null,
    },
    create: {
      userId: ngoUnverified.id,
      registrationNumber: 'NGO-PENDING-2026-004',
      mission: 'Youth and community nutritional support and evening food drives.',
      operationalAreas: 'Westside Suburbs',
      verificationStatus: 'PENDING',
      verificationNote: 'Registration document pending administrator audit.',
    },
  });

  // 4. Seed the 12 Requested Demonstration Food Listings
  const now = new Date();

  const demoDonationsData = [
    {
      id: 'demo-donation-1',
      donorId: donorSpice.id,
      title: 'Vegetable Biryani with Raita & Salan [Demo]',
      category: 'Cooked Meals',
      quantity: '40 Servings',
      quantityNumeric: 40,
      description: 'Fragrant basmati rice cooked with fresh seasonal vegetables and spices. Packed in food-grade catering trays, hot-held safely.',
      dietaryInfo: 'Vegetarian, Halal',
      storageRequirement: 'Keep Hot (>60°C) or Refrigerate immediately',
      preparationDate: new Date(now.getTime() - 2 * 3600000),
      collectionDeadline: new Date(now.getTime() + 8 * 3600000),
      pickupLocation: '45 Brigade Road, Central District, Bengaluru',
      pickupInstructions: 'Collect at kitchen dispatch door; ring delivery bell.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-2',
      donorId: donor2.id,
      title: 'Fresh Sourdough Bread and Croissants [Demo]',
      category: 'Bakery & Bread',
      quantity: '25 Assorted Loaves & Pastries',
      quantityNumeric: 25,
      description: 'Artisan sourdough bread and golden butter croissants baked fresh this morning. Boxed and ready for pickup.',
      dietaryInfo: 'Vegetarian, Contains Gluten',
      storageRequirement: 'Room Temperature / Dry',
      preparationDate: new Date(now.getTime() - 4 * 3600000),
      collectionDeadline: new Date(now.getTime() + 14 * 3600000),
      pickupLocation: '88 Baker Avenue, Northside, Bengaluru',
      pickupInstructions: 'Store counter staff has bagged boxes labeled for FoodRescue.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-3',
      donorId: donorDairy.id,
      title: 'Mixed Seasonal Fruits (Apples, Bananas, Oranges) [Demo]',
      category: 'Produce & Fruits',
      quantity: '30 kg in Crates',
      quantityNumeric: 30,
      description: 'Ripe and sweet seasonal fruit crates from weekly supermarket stock. Clean and ready to eat or distribute.',
      dietaryInfo: 'Vegan, Organic, Raw',
      storageRequirement: 'Cool dry area',
      preparationDate: new Date(now.getTime() - 10 * 3600000),
      collectionDeadline: new Date(now.getTime() + 26 * 3600000),
      pickupLocation: '78 MG Road, Commercial Zone, Bengaluru',
      pickupInstructions: 'Loading bay 2 behind the supermarket.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-4',
      donorId: donor1.id,
      title: 'Fresh Farm Vegetables (Tomatoes, Spinach, Potatoes) [Demo]',
      category: 'Produce & Fruits',
      quantity: '45 kg Assorted Baskets',
      quantityNumeric: 45,
      description: 'Crisp tomatoes, washed spinach bundles, and fresh potatoes surplus from kitchen supplies.',
      dietaryInfo: 'Vegan, Raw',
      storageRequirement: 'Cool ventilated area',
      preparationDate: new Date(now.getTime() - 12 * 3600000),
      collectionDeadline: new Date(now.getTime() + 30 * 3600000),
      pickupLocation: '452 Elm Street, Downtown Dining District, Bengaluru',
      pickupInstructions: 'Kitchen entrance at rear alley.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-5',
      donorId: donorAnnapurna.id,
      title: 'Fresh Steamed Idli and Coconut Chutney [Demo]',
      category: 'Cooked Meals',
      quantity: '60 Pieces (15 Meal Packs)',
      quantityNumeric: 60,
      description: 'Soft steamed rice idlis with fresh coconut chutney and vegetable sambar in insulated containers.',
      dietaryInfo: 'Vegetarian, Vegan, Gluten-Free',
      storageRequirement: 'Keep Warm (>60°C)',
      preparationDate: new Date(now.getTime() - 2 * 3600000),
      collectionDeadline: new Date(now.getTime() + 6 * 3600000),
      pickupLocation: '12 Temple Road, Indiranagar, Bengaluru',
      pickupInstructions: 'Ask for manager at reception.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-6',
      donorId: donorSpice.id,
      title: 'Crispy Vegetable Samosas and Evening Snacks [Demo]',
      category: 'Cooked Meals',
      quantity: '50 Snack Pieces',
      quantityNumeric: 50,
      description: 'Spiced potato and pea samosas freshly prepared for an event. Packed in bakery boxes with mint chutney.',
      dietaryInfo: 'Vegetarian',
      storageRequirement: 'Ambient / Keep Dry',
      preparationDate: new Date(now.getTime() - 3 * 3600000),
      collectionDeadline: new Date(now.getTime() + 5 * 3600000),
      pickupLocation: '45 Brigade Road, Central District, Bengaluru',
      pickupInstructions: 'Rear staff entrance.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-7',
      donorId: donor3.id,
      title: 'Gourmet Vegetable Sandwiches [Demo]',
      category: 'Cooked Meals',
      quantity: '35 Wrapped Packs',
      quantityNumeric: 35,
      description: 'Individually wrapped fresh whole-grain sandwiches with cheese, cucumber, tomato, and mint chutney spread.',
      dietaryInfo: 'Vegetarian',
      storageRequirement: 'Chilled (<5°C)',
      preparationDate: new Date(now.getTime() - 3 * 3600000),
      collectionDeadline: new Date(now.getTime() + 7 * 3600000),
      pickupLocation: '1200 Grand Boulevard, Loading Dock B, Bengaluru',
      pickupInstructions: 'Security gate will direct to catering kitchen.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-8',
      donorId: donorDairy.id,
      title: 'Pasteurized Milk and Fresh Yogurt Tubs [Demo]',
      category: 'Dairy & Eggs',
      quantity: '25 Liters / 30 Cups',
      quantityNumeric: 25,
      description: 'Sealed pasteurized milk pouches and fresh plain yogurt cups from local dairy stock.',
      dietaryInfo: 'Vegetarian, Contains Dairy',
      storageRequirement: 'Refrigerated (2-4°C)',
      preparationDate: new Date(now.getTime() - 8 * 3600000),
      collectionDeadline: new Date(now.getTime() + 20 * 3600000),
      pickupLocation: '78 MG Road, Commercial Zone, Bengaluru',
      pickupInstructions: 'Cold storage pickup desk.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-9',
      donorId: donorAnnapurna.id,
      title: 'Wholesome Steamed Rice and Dal Meals [Demo]',
      category: 'Cooked Meals',
      quantity: '55 Meal Trays',
      quantityNumeric: 55,
      description: 'Nutritious yellow dal tadka and steamed basmati rice with mild tempered spices, packed in warm foil containers.',
      dietaryInfo: 'Vegetarian, Vegan, Gluten-Free',
      storageRequirement: 'Keep Hot (>60°C) or Refrigerate',
      preparationDate: new Date(now.getTime() - 2 * 3600000),
      collectionDeadline: new Date(now.getTime() + 9 * 3600000),
      pickupLocation: '12 Temple Road, Indiranagar, Bengaluru',
      pickupInstructions: 'Kitchen door at side alley.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-10',
      donorId: donor1.id,
      title: 'Fresh Whole-Wheat Chapatis and Mixed Veg Curry [Demo]',
      category: 'Cooked Meals',
      quantity: '80 Chapatis with Curry',
      quantityNumeric: 80,
      description: 'Soft hand-made whole-wheat chapatis with vegetable curry packed in sanitary containers.',
      dietaryInfo: 'Vegetarian',
      storageRequirement: 'Room Temperature / Keep Covered',
      preparationDate: new Date(now.getTime() - 2 * 3600000),
      collectionDeadline: new Date(now.getTime() + 8 * 3600000),
      pickupLocation: '452 Elm Street, Downtown Dining District, Bengaluru',
      pickupInstructions: 'Back door collection.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-11',
      donorId: donorDairy.id,
      title: 'Packaged Biscuits, Oats and Sealed Cereals [Demo]',
      category: 'Packaged & Canned',
      quantity: '40 Sealed Boxes',
      quantityNumeric: 40,
      description: 'Clean factory-sealed whole grain cereals, digestive biscuits, and rolled oats suitable for family food packets.',
      dietaryInfo: 'Vegetarian',
      storageRequirement: 'Dry / Room Temperature',
      preparationDate: new Date(now.getTime() - 24 * 3600000),
      collectionDeadline: new Date(now.getTime() + 72 * 3600000),
      pickupLocation: '78 MG Road, Commercial Zone, Bengaluru',
      pickupInstructions: 'Supermarket customer service counter.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-donation-12',
      donorId: donor2.id,
      title: 'Fresh Bakery Pastries, Muffins and Buns [Demo]',
      category: 'Bakery & Bread',
      quantity: '35 Assorted Pastries',
      quantityNumeric: 35,
      description: 'Assorted fruit muffins, cinnamon buns, and chocolate brioche pastries boxed safely for community distribution.',
      dietaryInfo: 'Vegetarian, Contains Gluten',
      storageRequirement: 'Room Temperature / Dry',
      preparationDate: new Date(now.getTime() - 4 * 3600000),
      collectionDeadline: new Date(now.getTime() + 12 * 3600000),
      pickupLocation: '88 Baker Avenue, Northside, Bengaluru',
      pickupInstructions: 'Ask for bakery manager on duty.',
      status: 'AVAILABLE',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Upsert all 12 demonstration donations by ID to prevent duplication and preserve user donations
  for (const item of demoDonationsData) {
    await prisma.donation.upsert({
      where: { id: item.id },
      update: {
        donorId: item.donorId,
        title: item.title,
        category: item.category,
        quantity: item.quantity,
        quantityNumeric: item.quantityNumeric,
        description: item.description,
        dietaryInfo: item.dietaryInfo,
        storageRequirement: item.storageRequirement,
        preparationDate: item.preparationDate,
        collectionDeadline: item.collectionDeadline,
        pickupLocation: item.pickupLocation,
        pickupInstructions: item.pickupInstructions,
        status: item.status,
        imageUrl: item.imageUrl,
      },
      create: {
        id: item.id,
        donorId: item.donorId,
        title: item.title,
        category: item.category,
        quantity: item.quantity,
        quantityNumeric: item.quantityNumeric,
        description: item.description,
        dietaryInfo: item.dietaryInfo,
        storageRequirement: item.storageRequirement,
        preparationDate: item.preparationDate,
        collectionDeadline: item.collectionDeadline,
        pickupLocation: item.pickupLocation,
        pickupInstructions: item.pickupInstructions,
        status: item.status,
        imageUrl: item.imageUrl,
      },
    });
  }

  // 5. Seed one completed sample donation for reporting if it doesn't already exist
  await prisma.donation.upsert({
    where: { id: 'demo-donation-completed' },
    update: {
      status: 'COMPLETED',
      collectionDeadline: new Date(now.getTime() - 12 * 3600000),
    },
    create: {
      id: 'demo-donation-completed',
      donorId: donor1.id,
      title: '50 Hot Meals Distributed to Shelter [Demo]',
      category: 'Cooked Meals',
      quantity: '50 Meals',
      quantityNumeric: 50,
      description: 'Distributed successfully to Hope Haven community kitchen.',
      dietaryInfo: 'Vegetarian',
      storageRequirement: 'Delivered',
      preparationDate: new Date(now.getTime() - 48 * 3600000),
      collectionDeadline: new Date(now.getTime() - 12 * 3600000),
      pickupLocation: '452 Elm Street, Bengaluru',
      status: 'COMPLETED',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    },
  });

  return { admin, donor1, ngo1 };
}

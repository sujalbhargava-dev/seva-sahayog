import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

import User from '../src/models/User.model';
import WorkerProfile from '../src/models/WorkerProfile.model';
import Service from '../src/models/Service.model';
import { Role, VerificationStatus, Language } from '../src/utils/constants';

const MONGO_URI = process.env.MONGO_URI || '';

const services = [
  { name: 'Plumbing', category: 'Home Repair', description: 'Plumbing services including pipe fixing, leak repair, and installation', basePrice: 300 },
  { name: 'Electrical Work', category: 'Home Repair', description: 'Electrical wiring, switch repair, fan installation, and more', basePrice: 350 },
  { name: 'Carpentry', category: 'Home Repair', description: 'Furniture repair, door fixing, woodwork, and carpentry services', basePrice: 400 },
  { name: 'Painting', category: 'Home Improvement', description: 'Interior and exterior wall painting and whitewashing', basePrice: 500 },
  { name: 'AC Repair', category: 'Appliance Repair', description: 'Air conditioner servicing, gas refilling, and repair', basePrice: 450 },
  { name: 'Cleaning', category: 'Home Services', description: 'Deep cleaning, regular cleaning, and sanitization services', basePrice: 250 },
  { name: 'Pest Control', category: 'Home Services', description: 'Cockroach, termite, mosquito, and general pest control', basePrice: 600 },
  { name: 'Appliance Repair', category: 'Appliance Repair', description: 'Washing machine, refrigerator, and appliance repair', basePrice: 400 },
  { name: 'Masonry', category: 'Construction', description: 'Brick laying, tile work, concrete work, and masonry', basePrice: 500 },
  { name: 'Tailoring', category: 'Personal Services', description: 'Clothes stitching, alteration, and tailoring services', basePrice: 200 },
  { name: 'Gardening', category: 'Home Services', description: 'Garden maintenance, landscaping, and plant care', basePrice: 300 },
  { name: 'Welding', category: 'Construction', description: 'Metal welding, gate repair, and fabrication work', basePrice: 450 },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected');

    // --- Seed Admin ---
    const existingAdmin = await User.findOne({ role: Role.ADMIN });
    if (!existingAdmin) {
      const admin = await User.create({
        name: 'SewaShayog Admin',
        phone: '9999999999',
        email: 'admin@sewashayog.in',
        passwordHash: 'Admin@123456',
        role: Role.ADMIN,
        language: Language.EN,
      });
      console.log(`✅ Admin created: admin@sewashayog.in / Admin@123456`);
    } else {
      console.log('ℹ️  Admin already exists, skipping');
    }

    // --- Seed Services ---
    const existingServiceCount = await Service.countDocuments();
    if (existingServiceCount === 0) {
      await Service.insertMany(services);
      console.log(`✅ ${services.length} services seeded`);
    } else {
      console.log(`ℹ️  ${existingServiceCount} services already exist, skipping`);
    }

    // --- Seed Sample Workers ---
    const existingWorkerCount = await User.countDocuments({ role: Role.WORKER });
    if (existingWorkerCount === 0) {
      const sampleWorkers = [
        {
          name: 'Rajesh Kumar',
          phone: '9876543210',
          email: 'rajesh@example.com',
          password: 'Worker@123',
          skills: ['Plumbing', 'Electrical Work'],
          lat: 28.6139,
          lng: 77.2090,
          address: 'Connaught Place, New Delhi',
        },
        {
          name: 'Suresh Sharma',
          phone: '9876543211',
          email: 'suresh@example.com',
          password: 'Worker@123',
          skills: ['Carpentry', 'Painting'],
          lat: 28.5355,
          lng: 77.3910,
          address: 'Noida Sector 62, UP',
        },
        {
          name: 'Amit Verma',
          phone: '9876543212',
          email: 'amit@example.com',
          password: 'Worker@123',
          skills: ['AC Repair', 'Appliance Repair'],
          lat: 28.4595,
          lng: 77.0266,
          address: 'Gurgaon, Haryana',
        },
      ];

      for (const w of sampleWorkers) {
        const user = await User.create({
          name: w.name,
          phone: w.phone,
          email: w.email,
          passwordHash: w.password,
          role: Role.WORKER,
          language: Language.HI,
        });

        await WorkerProfile.create({
          userId: user._id,
          skills: w.skills,
          experience: Math.floor(Math.random() * 10) + 1,
          location: {
            type: 'Point',
            coordinates: [w.lng, w.lat],
            address: w.address,
          },
          availability: true,
          rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
          totalJobs: Math.floor(Math.random() * 50),
          verificationStatus: VerificationStatus.APPROVED,
          cooperativeMember: true,
        });

        console.log(`✅ Worker created: ${w.name} (${w.email})`);
      }
    } else {
      console.log(`ℹ️  ${existingWorkerCount} workers already exist, skipping`);
    }

    // --- Seed Sample Customer ---
    const existingCustomerCount = await User.countDocuments({ role: Role.CUSTOMER });
    if (existingCustomerCount === 0) {
      await User.create({
        name: 'Test Customer',
        phone: '9898989898',
        email: 'customer@example.com',
        passwordHash: 'Customer@123',
        role: Role.CUSTOMER,
        language: Language.EN,
      });
      console.log('✅ Customer created: customer@example.com / Customer@123');
    } else {
      console.log(`ℹ️  ${existingCustomerCount} customers already exist, skipping`);
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

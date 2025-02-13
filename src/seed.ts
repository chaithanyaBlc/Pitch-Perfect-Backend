// seed.ts
import sequelize from './config/db';
import { Location } from './models/Location';
import { Turf } from './models/Turf';

async function seedData() {
  try {
    // Sync the database (force: true drops existing tables)
    await sequelize.sync();
    console.log('Database synced.');

    // Create two sample locations
    const location1 = await Location.create({
      name: "Central Park",
      coordinates: { lat: 40.785091, lng: -73.968285 },
      amenities: { wifi: true, parking: false },
      city: "New York",
      description: "A large public park in NYC.",
      images: ["centralpark1.jpg", "centralpark2.jpg"],
      openingTime: "06:00",
      closingTime: "23:00",
      status: "active",
      adminId: 1,
      managerId: null,
    });

    const location2 = await Location.create({
      name: "Downtown Arena",
      coordinates: { lat: 34.052235, lng: -118.243683 },
      amenities: { wifi: false, parking: true },
      city: "Los Angeles",
      description: "Modern sports arena in downtown LA.",
      images: ["downtownarena1.jpg"],
      openingTime: "08:00",
      closingTime: "22:00",
      status: "active",
      adminId: 2,
      managerId: null,
    });

    // Create sample turfs associated with the above locations
    await Turf.create({
      name: "Football Turf",
      duration: 60,
      description: "High quality turf for football matches",
      cost_per_slot: 150,
      ground_type: "grass",
      sport_type: "football",
      images: ["turf1.jpg", "turf2.jpg"],
      locationId: location1.id,
      status: "active",
    });

    await Turf.create({
      name: "Cricket Turf",
      duration: 90,
      description: "Well-maintained turf for cricket",
      cost_per_slot: 200,
      ground_type: "synthetic",
      sport_type: "cricket",
      images: ["turf3.jpg"],
      locationId: location2.id,
      status: "active",
    });

    console.log("Dummy data seeded successfully.");
  } catch (error: any) {
    console.error("Error seeding data:", error.message);
  }
}

seedData();

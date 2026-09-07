import mongoose from "mongoose";
import bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";

import User from "../src/models/user.models";
import Donor from "../src/models/donor.models";
import BloodBank from "../src/models/blood_bank.models";
import Blood from "../src/models/blood.models";
import BloodRequest from "../src/models/blood_request.models";
import BloodDonation from "../src/models/blood_donation.models";
import Event from "../src/models/event.models";
import Schedule from "../src/models/schedule.model";
import DonationRequest from "../src/models/DonationRequest.model";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB...");

    // Clear existing collections
    // console.log("Clearing existing collections...");
    // await User.deleteMany({});
    // await Donor.deleteMany({});
    // await BloodBank.deleteMany({});
    // await Blood.deleteMany({});
    // await BloodRequest.deleteMany({});
    // await BloodDonation.deleteMany({});
    // await Event.deleteMany({});
    // await Schedule.deleteMany({});
    // await DonationRequest.deleteMany({});

    console.log("Seeding dummy data...");

    // 1. Create Users (Admin, Blood Bank, Donor)
    const adminEmail = "admin00@gmail.com";
    const bankEmail = "bloodbank00@gmail.com";
    const donorEmail = "donor00@gmail.com";
    const defaultPassword = "Password@123";

    const adminUser = new User({
      name: "Admin User",
      email: adminEmail,
      password: defaultPassword,
      role: "admin",
    });
    await adminUser.save();

    const bankUser = new User({
      name: "City Blood Bank",
      email: bankEmail,
      password: defaultPassword,
      role: "blood_bank",
    });
    await bankUser.save();

    const donorUser = new User({
      name: "John Doe",
      email: donorEmail,
      password: defaultPassword,
      role: "donor",
    });
    await donorUser.save();

    // 2. Create Blood Bank Profile
    const bloodBank = new BloodBank({
      user: bankUser._id,
      blood_bank: "City Blood Bank",
      location: { latitude: 40.7128, longitude: -74.0060 },
      address: "123 Main St, New York, NY",
      contact: "1234567890",
      verified: true,
      document: { publicId: "doc_123", url: "http://example.com/doc.pdf", fileType: "application/pdf" },
      profileImage: { url: "/defaultProfile.png", publicId: "" },
    });
    await bloodBank.save();

    // 3. Create Donor Profile
    const donor = new Donor({
      user: donorUser._id,
      donorId: "DNR" + Math.floor(Math.random() * 1000000),
      blood_group: "O+",
      age: 28,
      location: { latitude: 40.7306, longitude: -73.9352 },
      contact: "0987654321",
      address: "456 Elm St, New York, NY",
      status: true,
      score: 50,
      donated_volume: 500,
      total_donations: 1,
      unsuccessful_donations: 0,
      profileImage: { url: "/defaultProfile.png", publicId: "" },
      last_donation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      next_eligible_donation_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in future
    });
    await donor.save();

    // 4. Create Blood Stock
    const bloodStock = new Blood({
      blood_type: "O+",
      donation_type: "whole_blood",
      blood_units: 10,
      collected_date: new Date(),
      expiry_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days expiry
      status: "available",
      blood_bank: bloodBank._id,
      donor: donor._id,
    });
    await bloodStock.save();

    // 5. Create Blood Request
    const bloodRequest = new BloodRequest({
      bloodRequestId: "REQ" + Math.floor(Math.random() * 1000000),
      patientName: "Jane Smith",
      hospitalName: "General Hospital",
      address: "789 Pine St, New York, NY",
      hospitalAddress: { latitude: 40.7589, longitude: -73.9851 },
      requestDate: new Date(),
      blood_group: "A-",
      blood_component: "rbc",
      blood_quantity: 2,
      contactNumber: "1122334455",
      priorityLevel: "Urgent",
      status: "Pending",
      document: { publicId: "req_doc_1", url: "http://example.com/req.pdf", fileType: "application/pdf" },
      notes: "Please provide urgently.",
      requestor: donor._id,
      blood_bank: bloodBank._id,
    });
    await bloodRequest.save();

    // 6. Create Event
    const event = new Event({
      name: "Summer Blood Drive",
      startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      location: "Central Park",
      type: "normal",
      description: "Join us for our annual summer blood drive.",
      status: "upcoming",
      createdBy: bloodBank._id,
    });
    await event.save();

    // 7. Create Schedule
    const schedule = new Schedule({
      blood_bank: bloodBank._id,
      date: new Date(),
      time_slot: "10:00-11:00",
      isBooked: false,
    });
    await schedule.save();

    // 8. Create Donation Request
    const donationReq = new DonationRequest({
      donor: donor._id,
      blood_bank: bloodBank._id,
      requested_date: new Date(),
      status: "pending",
      scheduled_time_slot: "10:00-11:00",
    });
    await donationReq.save();

    // 9. Create Blood Donation (History)
    const bloodDonation = new BloodDonation({
      donorId: donor.donorId,
      donor_name: donorUser.name,
      donor_contact: donor.contact,
      donor_address: donor.address,
      donor_type: "registered",
      blood_type: donor.blood_group,
      donation_type: "whole_blood",
      blood_units: 1,
      collected_date: new Date(),
      blood_bank: bloodBank._id,
    });
    await bloodDonation.save();

    // Generate credentials file
    const credContent = `Roles & Credentials:\n\nAdmin:\nEmail: ${adminEmail}\nPassword: ${defaultPassword}\n\nBlood Bank:\nEmail: ${bankEmail}\nPassword: ${defaultPassword}\n\nDonor:\nEmail: ${donorEmail}\nPassword: ${defaultPassword}\n`;
    const credPath = path.join(process.cwd(), "cred.txt");
    fs.writeFileSync(credPath, credContent);

    console.log("Database seeded successfully!");
    console.log("Credentials saved to cred.txt");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();

/**
 * 🌱 HostelBuddy Seed Script
 * ─────────────────────────────────────────────────────────────
 * Creates initial data so you can log in right away.
 *
 * Usage:  cd backend   →   node seed.js
 *
 * ✅ Admin Login  →  email: admin@hostelbuddy.com  |  password: Admin@1234
 * ✅ Student Login →  email: student@hostelbuddy.com | password: Student@1234
 * ─────────────────────────────────────────────────────────────
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ─── Import Models ───────────────────────────────────────────
const Hostel = require("./models/Hostel");
const User = require("./models/User");
const Admin = require("./models/Admin");
const Student = require("./models/Student");

// ─── Config ──────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

const HOSTEL = {
  name: "Block A Boys Hostel",
  location: "Main Campus, North Wing",
  rooms: 50,
  capacity: 200,
  vacant: 50,
};

const ADMIN = {
  email: "admin@hostelbuddy.com",
  password: "Admin@1234",
  name: "Hostel Administrator",
  father_name: "Mr. Ahmed",
  contact: "9876543210",
  address: "Admin Office, Main Campus",
  dob: new Date("1985-06-15"),
  cnic: "3520212345671",
};

const STUDENT = {
  email: "student@hostelbuddy.com",
  password: "Student@1234",
  name: "Demo Student",
  reg_id: 2024001,
  room_no: 101,
  batch: 2024,
  dept: "Computer Science",
  course: "BS Computer Science",
  father_name: "Mr. Ali",
  contact: "9876543211",
  address: "123 Street, City",
  dob: new Date("2002-03-20"),
  cnic: "3520298765432",
};

// ─── Helper ───────────────────────────────────────────────────
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ─── Seed Function ────────────────────────────────────────────
const seed = async () => {
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI is not set in backend/.env");
    process.exit(1);
  }

  console.log("\n🔗  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅  Connected!\n");

  // ── 1. Create or reuse Hostel ───────────────────────────────
  let hostel = await Hostel.findOne({ name: HOSTEL.name });
  if (hostel) {
    console.log(`🏠  Hostel already exists: "${hostel.name}" (skipping)`);
  } else {
    hostel = await Hostel.create(HOSTEL);
    console.log(`🏠  Hostel created: "${hostel.name}"`);
  }

  // ── 2. Create Admin ─────────────────────────────────────────
  const existingAdminUser = await User.findOne({ email: ADMIN.email });
  if (existingAdminUser) {
    console.log(`👤  Admin already exists: ${ADMIN.email} (skipping)`);
  } else {
    const hashedAdminPass = await hashPassword(ADMIN.password);

    const adminUser = await User.create({
      email: ADMIN.email,
      password: hashedAdminPass,
      isAdmin: true,
    });

    await Admin.create({
      name: ADMIN.name,
      email: ADMIN.email,
      father_name: ADMIN.father_name,
      contact: ADMIN.contact,
      address: ADMIN.address,
      dob: ADMIN.dob,
      cnic: ADMIN.cnic,
      user: adminUser._id,
      hostel: hostel._id,
    });

    console.log(`👤  Admin created: ${ADMIN.email}`);
  }

  // ── 3. Create Student ────────────────────────────────────────
  const existingStudentUser = await User.findOne({ email: STUDENT.email });
  if (existingStudentUser) {
    console.log(`🎓  Student already exists: ${STUDENT.email} (skipping)`);
  } else {
    const existingStudentById = await Student.findOne({ reg_id: STUDENT.reg_id });
    if (existingStudentById) {
      console.log(`🎓  Student reg_id ${STUDENT.reg_id} already exists (skipping)`);
    } else {
      const hashedStudentPass = await hashPassword(STUDENT.password);

      const studentUser = await User.create({
        email: STUDENT.email,
        password: hashedStudentPass,
        isAdmin: false,
      });

      await Student.create({
        name: STUDENT.name,
        reg_id: STUDENT.reg_id,
        room_no: STUDENT.room_no,
        batch: STUDENT.batch,
        dept: STUDENT.dept,
        course: STUDENT.course,
        email: STUDENT.email,
        father_name: STUDENT.father_name,
        contact: STUDENT.contact,
        address: STUDENT.address,
        dob: STUDENT.dob,
        cnic: STUDENT.cnic,
        user: studentUser._id,
        hostel: hostel._id,
      });

      console.log(`🎓  Student created: ${STUDENT.email}`);
    }
  }

  // ── Done ─────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════════════╗
║              🌱  SEED COMPLETE — Ready to Login!          ║
╠══════════════════════════════════════════════════════════╣
║  👤 ADMIN LOGIN                                           ║
║     Email    : admin@hostelbuddy.com                      ║
║     Password : Admin@1234                                 ║
║     URL      : http://localhost:5173/auth/admin-login     ║
╠══════════════════════════════════════════════════════════╣
║  🎓 STUDENT LOGIN                                         ║
║     Email    : student@hostelbuddy.com                    ║
║     Password : Student@1234                               ║
║     URL      : http://localhost:5173/auth/login           ║
╚══════════════════════════════════════════════════════════╝
`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});

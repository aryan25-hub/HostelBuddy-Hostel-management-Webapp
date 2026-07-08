const express = require("express");
const connectDB = require("./utils/conn");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/complaint", require("./routes/complaintRoutes"));
app.use("/api/invoice", require("./routes/invoiceRoutes"));
app.use("/api/messoff", require("./routes/messoffRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/suggestion", require("./routes/suggestionRoutes"));

app.get("/api/seed", async (req, res) => {
  try {
    const Hostel = require("./models/Hostel");
    const User = require("./models/User");
    const Admin = require("./models/Admin");
    const Student = require("./models/Student");
    const bcrypt = require("bcryptjs");

    // 1. Wipe everything to start fresh and fix any corrupted partial states
    await Hostel.deleteMany({});
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Student.deleteMany({});

    // 2. Create fresh data
    const hostel = new Hostel({ name: "Block A Boys Hostel", location: "Main Campus", capacity: 100, rooms: 50, vacant: 100 });
    await hostel.save();

    const salt = await bcrypt.genSalt(10);

    const adminHashedPassword = await bcrypt.hash("Admin@1234", salt);
    const adminUser = new User({ email: "admin@hostelbuddy.com", password: adminHashedPassword, isAdmin: true });
    await adminUser.save();
    const adminProfile = new Admin({ user: adminUser.id, name: "Super Admin", email: "admin@hostelbuddy.com", father_name: "Admin Father", address: "123 Admin St", dob: new Date("1990-01-01"), cnic: "12345-6789012-3", contact: "0300-1234567", hostel: hostel.id });
    await adminProfile.save();

    const studentHashedPassword = await bcrypt.hash("Student@1234", salt);
    const studentUser = new User({ email: "student@hostelbuddy.com", password: studentHashedPassword, isAdmin: false });
    await studentUser.save();
    const studentProfile = new Student({ user: studentUser.id, name: "Demo Student", email: "student@hostelbuddy.com", father_name: "Student Father", address: "456 Student Ave", dob: new Date("2000-01-01"), cnic: "98765-4321098-7", course: "BSCS", reg_id: 12345, contact: "0300-9876543", hostel: hostel.id, room_no: 101, batch: 2024, dept: "CS" });
    await studentProfile.save();

    res.json({ message: "Seed successful! You can now log in." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});

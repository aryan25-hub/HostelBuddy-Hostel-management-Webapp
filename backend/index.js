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

    // 1. Check if seeded
    let hostel = await Hostel.findOne({ name: "Block A Boys Hostel" });
    if (!hostel) {
      hostel = new Hostel({ name: "Block A Boys Hostel", location: "Main Campus", capacity: 100, rooms: 50, vacant: 100 });
      await hostel.save();
    }

    let adminUser = await User.findOne({ email: "admin@hostelbuddy.com" });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@1234", salt);
      adminUser = new User({ email: "admin@hostelbuddy.com", password: hashedPassword, isAdmin: true });
      await adminUser.save();
      const adminProfile = new Admin({ user: adminUser.id, name: "Super Admin", cnic: "12345-6789012-3", contact: "0300-1234567", hostel: hostel.id });
      await adminProfile.save();
    }

    let studentUser = await User.findOne({ email: "student@hostelbuddy.com" });
    if (!studentUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Student@1234", salt);
      studentUser = new User({ email: "student@hostelbuddy.com", password: hashedPassword, isAdmin: false });
      await studentUser.save();
      const studentProfile = new Student({ user: studentUser.id, name: "Demo Student", reg_id: "CMS-12345", contact: "0300-9876543", hostel: hostel.id, room_no: 101, batch: "2024", dept: "CS" });
      await studentProfile.save();
    }

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

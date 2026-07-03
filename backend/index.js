const express = require("express");
const connectDB = require("./utils/conn");
const cors = require("cors");

const app = express();
const port = 3000;

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

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});

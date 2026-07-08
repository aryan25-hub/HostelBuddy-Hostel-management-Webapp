/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          🏨  HostelBuddy — Full API Demo Script                 ║
 * ║                                                                  ║
 * ║  Demos ALL 20 API endpoints across every feature:               ║
 * ║  Auth · Admin · Student · Attendance · Complaint ·              ║
 * ║  Suggestion · Mess-Off · Invoice · CSV Export                   ║
 * ║                                                                  ║
 * ║  Usage:  cd backend   →   node demo.js                          ║
 * ║  Prereq: npm run dev must be running (port 3000)                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

"use strict";

// ─── Config ────────────────────────────────────────────────────────────────────
const BASE = "http://localhost:3000/api";
const DELAY_MS = 600; // pause between calls so output is readable

// ─── Demo Credentials (created by seed.js) ─────────────────────────────────────
const ADMIN_EMAIL    = "admin@hostelbuddy.com";
const ADMIN_PASSWORD = "Admin@1234";
const STUDENT_EMAIL  = "student@hostelbuddy.com";
const STUDENT_PASS   = "Student@1234";

// ─── State (populated during run) ──────────────────────────────────────────────
let adminToken    = null;
let studentToken  = null;
let adminId       = null;
let studentId     = null;
let hostelId      = null;
let complaintId   = null;
let suggestionId  = null;
let messoffId     = null;

// ─── Terminal Colors ────────────────────────────────────────────────────────────
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  cyan:   "\x1b[36m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  magenta:"\x1b[35m",
  blue:   "\x1b[34m",
  gray:   "\x1b[90m",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
let passCount = 0;
let failCount = 0;
let skipCount = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const section = (title) => {
  console.log(`\n${C.bold}${C.blue}${"═".repeat(60)}${C.reset}`);
  console.log(`${C.bold}${C.blue}  ${title}${C.reset}`);
  console.log(`${C.blue}${"═".repeat(60)}${C.reset}`);
};

const log = {
  pass: (label, extra = "") => {
    passCount++;
    console.log(`  ${C.green}✅ PASS${C.reset}  ${C.bold}${label}${C.reset} ${C.gray}${extra}${C.reset}`);
  },
  fail: (label, reason = "") => {
    failCount++;
    console.log(`  ${C.red}❌ FAIL${C.reset}  ${C.bold}${label}${C.reset}  ${C.red}→ ${reason}${C.reset}`);
  },
  skip: (label, reason = "") => {
    skipCount++;
    console.log(`  ${C.yellow}⏭  SKIP${C.reset}  ${C.bold}${label}${C.reset}  ${C.yellow}→ ${reason}${C.reset}`);
  },
  info: (msg) => console.log(`  ${C.cyan}ℹ  ${msg}${C.reset}`),
  data: (key, val) => console.log(`  ${C.gray}   ${key}: ${JSON.stringify(val)}${C.reset}`),
};

/**
 * Wraps fetch with JSON parsing and error handling.
 * Returns { status, body } always — never throws.
 */
const api = async (method, path, body = null) => {
  try {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    let json = {};
    try { json = await res.json(); } catch (_) {}
    return { status: res.status, body: json };
  } catch (err) {
    return { status: 0, body: { error: err.message } };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 1 · AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
const demoAuth = async () => {
  section("1 · AUTHENTICATION");

  // 1a — Admin Login
  {
    const { status, body } = await api("POST", "/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (status === 200 && body.data?.token) {
      adminToken = body.data.token;
      log.pass("Admin Login", `token length=${adminToken.length}`);
    } else {
      log.fail("Admin Login", body.errors?.[0]?.msg || JSON.stringify(body));
    }
  }
  await sleep(DELAY_MS);

  // 1b — Student Login
  {
    const { status, body } = await api("POST", "/auth/login", {
      email: STUDENT_EMAIL,
      password: STUDENT_PASS,
    });
    if (status === 200 && body.data?.token) {
      studentToken = body.data.token;
      log.pass("Student Login", `token length=${studentToken.length}`);
    } else {
      log.fail("Student Login", body.errors?.[0]?.msg || JSON.stringify(body));
    }
  }
  await sleep(DELAY_MS);

  // 1c — Verify Admin Session
  if (adminToken) {
    const { status, body } = await api("POST", "/auth/verifysession", {
      token: adminToken,
    });
    if (status === 200 && body.success) {
      log.pass("Verify Admin Session", `isAdmin=${body.data?.isAdmin}`);
    } else {
      log.fail("Verify Admin Session", JSON.stringify(body));
    }
  } else {
    log.skip("Verify Admin Session", "no admin token");
  }
  await sleep(DELAY_MS);

  // 1d — Verify Student Session
  if (studentToken) {
    const { status, body } = await api("POST", "/auth/verifysession", {
      token: studentToken,
    });
    if (status === 200 && body.success) {
      log.pass("Verify Student Session", `isAdmin=${body.data?.isAdmin}`);
    } else {
      log.fail("Verify Student Session", JSON.stringify(body));
    }
  } else {
    log.skip("Verify Student Session", "no student token");
  }
  await sleep(DELAY_MS);

  // 1e — Bad Login (wrong password — should fail with 400)
  {
    const { status, body } = await api("POST", "/auth/login", {
      email: ADMIN_EMAIL,
      password: "wrongpassword",
    });
    if (status === 400) {
      log.pass("Reject Bad Password (security check)", "400 returned correctly");
    } else {
      log.fail("Reject Bad Password", `expected 400, got ${status}`);
    }
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 2 · ADMIN PORTAL
// ─────────────────────────────────────────────────────────────────────────────
const demoAdmin = async () => {
  section("2 · ADMIN PORTAL");

  if (!adminToken) {
    log.skip("All Admin tests", "admin token missing — login failed");
    return;
  }

  // 2a — Get Admin Profile
  {
    const { status, body } = await api("POST", "/admin/get-admin", {
      token: adminToken,
      isAdmin: true,
    });
    if (status === 200 && body.success) {
      adminId  = body.admin._id;
      hostelId = body.admin.hostel;
      log.pass("Get Admin Profile", `name="${body.admin.name}"`);
      log.data("adminId",  adminId);
      log.data("hostelId", hostelId);
    } else {
      log.fail("Get Admin Profile", JSON.stringify(body));
    }
  }
  await sleep(DELAY_MS);

  // 2b — Get Hostel Info
  if (adminId) {
    const { status, body } = await api("POST", "/admin/get-hostel", {
      id: adminId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Hostel Info", `name="${body.hostel.name}" rooms=${body.hostel.rooms}`);
    } else {
      log.fail("Get Hostel Info", JSON.stringify(body));
    }
  } else {
    log.skip("Get Hostel Info", "adminId not available");
  }
  await sleep(DELAY_MS);

  // 2c — Update Admin Profile
  {
    const { status, body } = await api("POST", "/admin/update-admin", {
      name: "Updated Hostel Admin",
      email: ADMIN_EMAIL,
      father_name: "Mr. Ahmed",
      contact: "9876543210",
      address: "Admin Block, Updated Campus",
      dob: "1985-06-15",
      cnic: "352021234567",
    });
    if (status === 200 && body.success) {
      log.pass("Update Admin Profile");
    } else {
      log.fail("Update Admin Profile", JSON.stringify(body));
    }
  }
  await sleep(DELAY_MS);

  // 2d — Register a new Admin (then delete it)
  {
    const testEmail = `demo_admin_${Date.now()}@test.com`;
    const { status, body } = await api("POST", "/admin/register-admin", {
      name: "Demo Admin Test",
      email: testEmail,
      father_name: "Test Father",
      contact: "9999999999",
      address: "Test Address",
      dob: "1990-01-01",
      cnic: "352099999999",
      hostel: "Block A Boys Hostel",
      password: "TestPass@123",
    });
    if (status === 200 && body.success) {
      log.pass("Register New Admin", `email=${testEmail}`);

      // Clean up — delete the test admin
      await sleep(DELAY_MS);
      const del = await api("POST", "/admin/delete-admin", { email: testEmail });
      if (del.body.success) {
        log.pass("Delete Test Admin (cleanup)", "deleted cleanly");
      } else {
        log.fail("Delete Test Admin", JSON.stringify(del.body));
      }
    } else {
      log.fail("Register New Admin", JSON.stringify(body));
    }
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 3 · STUDENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
const demoStudents = async () => {
  section("3 · STUDENT MANAGEMENT");

  // 3a — Get Student Profile (by token)
  if (studentToken) {
    const { status, body } = await api("POST", "/student/get-student", {
      token: studentToken,
      isAdmin: false,
    });
    if (status === 200 && body.success) {
      studentId = body.student._id;
      log.pass("Get Student Profile", `name="${body.student.name}" room=${body.student.room_no}`);
      log.data("studentId", studentId);
    } else {
      log.fail("Get Student Profile", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Profile", "no student token");
  }
  await sleep(DELAY_MS);

  // 3b — Get All Students in Hostel
  if (hostelId) {
    const { status, body } = await api("POST", "/student/get-all-students", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Get All Students", `count=${body.students.length}`);
    } else {
      log.fail("Get All Students", JSON.stringify(body));
    }
  } else {
    log.skip("Get All Students", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 3c — Register a New Student (then delete it)
  if (hostelId) {
    const testEmail = `demo_student_${Date.now()}@test.com`;
    const testRegId = Math.floor(Math.random() * 900000) + 100000; // always 6 digits
    const testCnic  = String(Math.floor(Math.random() * 900000000000) + 100000000000);

    const { status, body } = await api("POST", "/student/register-student", {
      name: "Demo Test Student",
      cms_id: String(testRegId),
      room_no: 201,
      batch: 2024,
      dept: "Computer Science",
      course: "BS CS",
      email: testEmail,
      father_name: "Demo Father",
      contact: "9123456780",
      address: "Test Address",
      dob: "2002-05-10",
      cnic: testCnic.slice(0, 12),
      hostel: "Block A Boys Hostel",
      password: "DemoPass@123",
    });

    if (status === 200 && body.success) {
      const newStudentId = body.student._id;
      log.pass("Register New Student", `email=${testEmail} id=${newStudentId}`);

      // Clean up
      await sleep(DELAY_MS);
      const del = await api("DELETE", "/student/delete-student", { id: newStudentId });
      if (del.body.success) {
        log.pass("Delete Test Student (cleanup)");
      } else {
        log.fail("Delete Test Student", JSON.stringify(del.body));
      }
    } else {
      log.fail("Register New Student", JSON.stringify(body));
    }
  } else {
    log.skip("Register New Student", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 3d — CSV Export
  if (hostelId) {
    const { status, body } = await api("POST", "/student/csv", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      const lines = body.csv.split("\n").length;
      log.pass("CSV Student Export", `${lines} lines generated`);
      log.info(`CSV preview: ${body.csv.slice(0, 80)}...`);
    } else {
      log.fail("CSV Student Export", JSON.stringify(body));
    }
  } else {
    log.skip("CSV Student Export", "hostelId not available");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 4 · ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────
const demoAttendance = async () => {
  section("4 · ATTENDANCE");

  // 4a — Mark Attendance (Present)
  if (studentId) {
    const { status, body } = await api("POST", "/attendance/mark", {
      student: studentId,
      status: "present",
    });
    // 201 = success, 409 = already marked today (both are fine for demo)
    if (status === 201) {
      log.pass("Mark Attendance — Present", "marked successfully");
    } else if (status === 409) {
      log.pass("Mark Attendance — Present", "already marked today (idempotency working ✓)");
    } else {
      log.fail("Mark Attendance", `status=${status} body=${JSON.stringify(body)}`);
    }
  } else {
    log.skip("Mark Attendance", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 4b — Get Student Attendance History
  if (studentId) {
    const { status, body } = await api("POST", "/attendance/get", {
      student: studentId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Student Attendance", `records=${body.attendance.length}`);
    } else {
      log.fail("Get Student Attendance", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Attendance", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 4c — Get Hostel-wide Attendance (Admin view)
  if (hostelId) {
    const { status, body } = await api("POST", "/attendance/getHostelAttendance", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Hostel Attendance (Admin)", `today's records=${body.attendance.length}`);
    } else {
      log.fail("Get Hostel Attendance", JSON.stringify(body));
    }
  } else {
    log.skip("Get Hostel Attendance", "hostelId not available");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 5 · COMPLAINTS
// ─────────────────────────────────────────────────────────────────────────────
const demoComplaints = async () => {
  section("5 · COMPLAINTS");

  // 5a — Submit Complaint
  if (studentId && hostelId) {
    const { status, body } = await api("POST", "/complaint/register", {
      student: studentId,
      hostel:  hostelId,
      type:    "Maintenance",
      title:   "Broken ceiling fan in Room 101",
      description: "The ceiling fan in room 101 has been broken for 3 days. Needs urgent repair.",
    });
    if (status === 200 && body.success) {
      log.pass("Submit Complaint", body.msg);
    } else {
      log.fail("Submit Complaint", JSON.stringify(body));
    }
  } else {
    log.skip("Submit Complaint", "studentId/hostelId not available");
  }
  await sleep(DELAY_MS);

  // 5b — Get Complaints by Student
  if (studentId) {
    const { status, body } = await api("POST", "/complaint/student", {
      student: studentId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Student Complaints", `count=${body.complaints.length}`);
      if (body.complaints.length > 0) {
        complaintId = body.complaints[body.complaints.length - 1]._id;
        log.data("complaintId", complaintId);
      }
    } else {
      log.fail("Get Student Complaints", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Complaints", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 5c — Get Complaints by Hostel (Admin view)
  if (hostelId) {
    const { status, body } = await api("POST", "/complaint/hostel/", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Hostel Complaints (Admin)", `count=${body.complaints.length}`);
    } else {
      log.fail("Get Hostel Complaints", JSON.stringify(body));
    }
  } else {
    log.skip("Get Hostel Complaints", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 5d — Resolve Complaint
  if (complaintId) {
    const { status, body } = await api("POST", "/complaint/resolve", {
      id: complaintId,
    });
    if (status === 200 && body.success) {
      log.pass("Resolve Complaint", `id=${complaintId}`);
    } else {
      log.fail("Resolve Complaint", JSON.stringify(body));
    }
  } else {
    log.skip("Resolve Complaint", "no complaint to resolve");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 6 · SUGGESTIONS
// ─────────────────────────────────────────────────────────────────────────────
const demoSuggestions = async () => {
  section("6 · SUGGESTIONS");

  // 6a — Submit Suggestion
  if (studentId && hostelId) {
    const { status, body } = await api("POST", "/suggestion/register", {
      student:     studentId,
      hostel:      hostelId,
      title:       "Add study room on Ground Floor",
      description: "A dedicated study room would help students prepare for exams.",
    });
    if (status === 200 && body.success) {
      log.pass("Submit Suggestion", body.msg || "registered");
    } else {
      log.fail("Submit Suggestion", JSON.stringify(body));
    }
  } else {
    log.skip("Submit Suggestion", "studentId/hostelId not available");
  }
  await sleep(DELAY_MS);

  // 6b — Get Suggestions by Hostel (Admin view)
  if (hostelId) {
    const { status, body } = await api("POST", "/suggestion/hostel", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Hostel Suggestions (Admin)", `count=${body.suggestions.length}`);
      if (body.suggestions.length > 0) {
        suggestionId = body.suggestions[body.suggestions.length - 1]._id;
        log.data("suggestionId", suggestionId);
      }
    } else {
      log.fail("Get Hostel Suggestions", JSON.stringify(body));
    }
  } else {
    log.skip("Get Hostel Suggestions", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 6c — Get Suggestions by Student
  if (studentId) {
    const { status, body } = await api("POST", "/suggestion/student", {
      student: studentId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Student Suggestions", `count=${body.suggestions.length}`);
    } else {
      log.fail("Get Student Suggestions", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Suggestions", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 6d — Update Suggestion Status (Admin — mark as reviewed)
  if (suggestionId) {
    const { status, body } = await api("POST", "/suggestion/update", {
      id:     suggestionId,
      status: "reviewed",
    });
    if (status === 200 && body.success) {
      log.pass("Update Suggestion Status", "marked as reviewed");
    } else {
      log.fail("Update Suggestion Status", JSON.stringify(body));
    }
  } else {
    log.skip("Update Suggestion Status", "no suggestion to update");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 7 · MESS-OFF REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
const demoMessOff = async () => {
  section("7 · MESS-OFF (Leave) REQUESTS");

  // Build future dates for the request
  const today = new Date();
  const leaving = new Date(today);
  leaving.setDate(leaving.getDate() + 3);
  const returning = new Date(today);
  returning.setDate(returning.getDate() + 8);

  const leavingStr   = leaving.toISOString().split("T")[0];
  const returningStr = returning.toISOString().split("T")[0];

  // 7a — Student submits Mess-Off Request
  if (studentId) {
    const { status, body } = await api("POST", "/messoff/request", {
      student:      studentId,
      leaving_date: leavingStr,
      return_date:  returningStr,
    });
    if (status === 200 && body.success) {
      log.pass("Student: Submit Mess-Off Request", `${leavingStr} → ${returningStr}`);
    } else {
      log.fail("Submit Mess-Off Request", JSON.stringify(body));
    }
  } else {
    log.skip("Submit Mess-Off Request", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 7b — Count / Summary of student's mess-off this month
  if (studentId) {
    const { status, body } = await api("POST", "/messoff/count", {
      student: studentId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Student Mess-Off Count", `total=${body.list.length} approvedDays=${body.approved}`);
    } else {
      log.fail("Get Student Mess-Off Count", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Mess-Off Count", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 7c — Admin: List all pending requests
  if (hostelId) {
    const { status, body } = await api("POST", "/messoff/list", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Admin: List Mess-Off Requests", `pending=${body.list.length} approved=${body.approved} rejected=${body.rejected}`);
      if (body.list.length > 0) {
        messoffId = body.list[0]._id;
        log.data("messoffId", messoffId);
      }
    } else {
      log.fail("Admin: List Mess-Off Requests", JSON.stringify(body));
    }
  } else {
    log.skip("Admin: List Mess-Off Requests", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 7d — Admin: Approve the request
  if (messoffId) {
    const { status, body } = await api("POST", "/messoff/update", {
      id:     messoffId,
      status: "approved",
    });
    if (status === 200 && body.success) {
      log.pass("Admin: Approve Mess-Off Request", `id=${messoffId}`);
    } else {
      log.fail("Admin: Approve Mess-Off Request", JSON.stringify(body));
    }
  } else {
    log.skip("Admin: Approve Mess-Off Request", "no pending request found");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 8 · INVOICES
// ─────────────────────────────────────────────────────────────────────────────
const demoInvoices = async () => {
  section("8 · INVOICES (Mess Billing)");

  // 8a — Admin: Generate Monthly Invoices for hostel
  if (hostelId) {
    const { status, body } = await api("POST", "/invoice/generate", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Generate Monthly Invoices", `invoices created=${body.count}`);
    } else if (status === 400 && body.errors === "Invoices already generated") {
      log.pass("Generate Monthly Invoices", "already generated this month (idempotency ✓)");
    } else {
      log.fail("Generate Monthly Invoices", JSON.stringify(body));
    }
  } else {
    log.skip("Generate Monthly Invoices", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 8b — Admin: Get all invoices for hostel
  if (hostelId) {
    const { status, body } = await api("POST", "/invoice/getbyid", {
      hostel: hostelId,
    });
    if (status === 200 && body.success) {
      log.pass("Get All Hostel Invoices (Admin)", `count=${body.invoices.length}`);
    } else {
      log.fail("Get All Hostel Invoices", JSON.stringify(body));
    }
  } else {
    log.skip("Get All Hostel Invoices", "hostelId not available");
  }
  await sleep(DELAY_MS);

  // 8c — Student: Get my invoices
  if (studentId) {
    const { status, body } = await api("POST", "/invoice/student", {
      student: studentId,
    });
    if (status === 200 && body.success) {
      log.pass("Get Student Invoices", `count=${body.invoices.length}`);
      if (body.invoices.length > 0) {
        const inv = body.invoices[0];
        log.info(`Latest invoice: amount=₹${inv.amount} status=${inv.status}`);
      }
    } else {
      log.fail("Get Student Invoices", JSON.stringify(body));
    }
  } else {
    log.skip("Get Student Invoices", "studentId not available");
  }
  await sleep(DELAY_MS);

  // 8d — Admin: Mark Invoice as Paid
  if (studentId) {
    const { status, body } = await api("POST", "/invoice/update", {
      student: studentId,
      status:  "paid",
    });
    if (status === 200 && body.success) {
      log.pass("Mark Invoice as Paid (Admin)", "status updated to 'paid'");
    } else {
      log.fail("Mark Invoice as Paid", JSON.stringify(body));
    }
  } else {
    log.skip("Mark Invoice as Paid", "studentId not available");
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION 9 · SECURITY CHECKS
// ─────────────────────────────────────────────────────────────────────────────
const demoSecurity = async () => {
  section("9 · SECURITY CHECKS");

  // 9a — Student token should NOT access Admin-only route
  if (studentToken) {
    const { status, body } = await api("POST", "/admin/get-admin", {
      token:   studentToken,
      isAdmin: false,   // student pretending
    });
    if (status === 401 || (status === 400 && !body.success)) {
      log.pass("Student Can't Access Admin Route", `status=${status} (blocked correctly)`);
    } else {
      log.fail("Student Can't Access Admin Route", `status=${status} — security gap!`);
    }
  } else {
    log.skip("Student token blocked from admin route", "no student token");
  }
  await sleep(DELAY_MS);

  // 9b — Invalid token rejected
  {
    const { status, body } = await api("POST", "/auth/verifysession", {
      token: "this.is.a.fake.token",
    });
    if (status !== 200 && !body.success) {
      log.pass("Invalid Token Rejected", `status=${status}`);
    } else {
      log.fail("Invalid Token Rejected", "fake token was accepted — security gap!");
    }
  }
  await sleep(DELAY_MS);

  // 9c — Password change with wrong old password should fail
  {
    const { status, body } = await api("POST", "/auth/change-password", {
      email:       STUDENT_EMAIL,
      password:    "WrongOldPass@999",
      newPassword: "NewPass@12345",
    });
    if (status === 400 && !body.success) {
      log.pass("Reject Wrong Old Password on Change", "400 returned correctly");
    } else {
      log.fail("Reject Wrong Old Password on Change", `status=${status}`);
    }
  }
  await sleep(DELAY_MS);
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
const printSummary = () => {
  const total = passCount + failCount + skipCount;
  console.log(`\n${C.bold}${C.blue}${"═".repeat(60)}${C.reset}`);
  console.log(`${C.bold}${C.blue}  DEMO COMPLETE — RESULTS SUMMARY${C.reset}`);
  console.log(`${C.blue}${"═".repeat(60)}${C.reset}`);
  console.log(`  ${C.green}✅ PASSED : ${passCount}${C.reset}`);
  console.log(`  ${C.red}❌ FAILED : ${failCount}${C.reset}`);
  console.log(`  ${C.yellow}⏭  SKIPPED: ${skipCount}${C.reset}`);
  console.log(`  ${C.gray}   TOTAL  : ${total}${C.reset}`);
  console.log(`${C.blue}${"═".repeat(60)}${C.reset}`);

  if (failCount === 0) {
    console.log(`\n  ${C.bold}${C.green}🎉 All tests passed! App is fully functional.${C.reset}\n`);
  } else {
    console.log(`\n  ${C.bold}${C.red}⚠  ${failCount} test(s) failed. Check output above for details.${C.reset}\n`);
  }

  console.log(`  ${C.bold}LOGIN CREDENTIALS${C.reset}`);
  console.log(`  ${C.cyan}Admin   → http://localhost:5173/auth/admin-login${C.reset}`);
  console.log(`  ${C.cyan}          email: ${ADMIN_EMAIL}  pass: ${ADMIN_PASSWORD}${C.reset}`);
  console.log(`  ${C.cyan}Student → http://localhost:5173/auth/login${C.reset}`);
  console.log(`  ${C.cyan}          email: ${STUDENT_EMAIL}  pass: ${STUDENT_PASS}${C.reset}\n`);
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────────────────────
const main = async () => {
  console.log(`\n${C.bold}${C.magenta}`);
  console.log(`╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║        🏨  HostelBuddy — Full API Demo Script               ║`);
  console.log(`║        Testing all 20 endpoints across 9 feature areas      ║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log(`  ${C.gray}Backend: ${BASE}${C.reset}`);

  // Check server is reachable first
  const ping = await api("POST", "/auth/login", { email: "x", password: "x" });
  if (ping.status === 0) {
    console.log(`\n${C.red}${C.bold}  ❌  Cannot reach ${BASE}${C.reset}`);
    console.log(`  ${C.yellow}  → Make sure the backend is running: npm run dev (from project root)${C.reset}\n`);
    process.exit(1);
  }
  console.log(`  ${C.green}✅  Backend is reachable (port 3000)${C.reset}`);

  await demoAuth();
  await demoAdmin();
  await demoStudents();
  await demoAttendance();
  await demoComplaints();
  await demoSuggestions();
  await demoMessOff();
  await demoInvoices();
  await demoSecurity();

  printSummary();
};

main().catch((err) => {
  console.error(`\n${C.red}Unhandled error:${C.reset}`, err.message);
  process.exit(1);
});

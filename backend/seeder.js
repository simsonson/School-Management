const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');

// Force Google public DNS — fixes "querySrv ECONNREFUSED" on networks
// where the default DNS resolver can't handle SRV lookups
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Homework = require('./src/models/Homework');
const Mark = require('./src/models/Mark');
const Fee = require('./src/models/Fee');

// Load env vars
dotenv.config();

// ── 20 Students with realistic data ──────────────────────────────────
const students = [
  { name: 'Aarav Sharma',    class: 'Grade 10-A', dob: '2010-03-15', guardian: 'Rajesh Sharma',    guardianPhone: '9876543210' },
  { name: 'Ananya Patel',    class: 'Grade 10-A', dob: '2010-07-22', guardian: 'Suresh Patel',     guardianPhone: '9876543211' },
  { name: 'Vivaan Gupta',    class: 'Grade 10-A', dob: '2010-01-08', guardian: 'Amit Gupta',       guardianPhone: '9876543212' },
  { name: 'Diya Singh',      class: 'Grade 10-A', dob: '2010-11-30', guardian: 'Harpreet Singh',   guardianPhone: '9876543213' },
  { name: 'Arjun Reddy',     class: 'Grade 10-A', dob: '2010-05-18', guardian: 'Venkat Reddy',     guardianPhone: '9876543214' },
  { name: 'Ishita Verma',    class: 'Grade 10-B', dob: '2010-09-12', guardian: 'Rakesh Verma',     guardianPhone: '9876543215' },
  { name: 'Kabir Joshi',     class: 'Grade 10-B', dob: '2010-02-25', guardian: 'Manoj Joshi',      guardianPhone: '9876543216' },
  { name: 'Myra Iyer',       class: 'Grade 10-B', dob: '2010-06-03', guardian: 'Srinivas Iyer',    guardianPhone: '9876543217' },
  { name: 'Reyansh Kumar',   class: 'Grade 10-B', dob: '2010-12-14', guardian: 'Pramod Kumar',     guardianPhone: '9876543218' },
  { name: 'Saanvi Nair',     class: 'Grade 10-B', dob: '2010-04-09', guardian: 'Anil Nair',        guardianPhone: '9876543219' },
  { name: 'Aditya Mishra',   class: 'Grade 9-A',  dob: '2011-08-20', guardian: 'Deepak Mishra',    guardianPhone: '9876543220' },
  { name: 'Kavya Desai',     class: 'Grade 9-A',  dob: '2011-10-05', guardian: 'Nilesh Desai',     guardianPhone: '9876543221' },
  { name: 'Rohan Mehta',     class: 'Grade 9-A',  dob: '2011-01-17', guardian: 'Sanjay Mehta',     guardianPhone: '9876543222' },
  { name: 'Priya Choudhury', class: 'Grade 9-A',  dob: '2011-07-28', guardian: 'Ashok Choudhury',  guardianPhone: '9876543223' },
  { name: 'Vihaan Kapoor',   class: 'Grade 9-A',  dob: '2011-03-11', guardian: 'Rahul Kapoor',     guardianPhone: '9876543224' },
  { name: 'Anika Bhat',      class: 'Grade 8-A',  dob: '2012-05-22', guardian: 'Sudhir Bhat',      guardianPhone: '9876543225' },
  { name: 'Arnav Saxena',    class: 'Grade 8-A',  dob: '2012-09-14', guardian: 'Vikram Saxena',    guardianPhone: '9876543226' },
  { name: 'Mira Chatterjee', class: 'Grade 8-A',  dob: '2012-02-07', guardian: 'Soumen Chatterjee',guardianPhone: '9876543227' },
  { name: 'Dhruv Malhotra',  class: 'Grade 8-A',  dob: '2012-11-19', guardian: 'Gaurav Malhotra',  guardianPhone: '9876543228' },
  { name: 'Siya Pillai',     class: 'Grade 8-A',  dob: '2012-06-30', guardian: 'Krishnan Pillai',  guardianPhone: '9876543229' },
];

const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies'];
const feeTypes = ['Tuition', 'Library', 'Exam', 'Lab', 'Sports'];

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    // Clean existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Homework.deleteMany();
    await Mark.deleteMany();
    await Fee.deleteMany();

    console.log('🗑️  Cleared existing data.');

    // ── 1. Principal ─────────────────────────────────────────────────
    const principal = await User.create({
      name: 'Principal Sarah',
      email: 'principal@school.com',
      password: 'password123',
      role: 'Principal',
    });
    console.log('👩‍💼 Principal created.');

    // ── 2. Admins ────────────────────────────────────────────────────
    const admin1 = await User.create({
      name: 'Admin One',
      email: 'admin1@school.com',
      password: 'password123',
      role: 'Admin',
    });
    console.log('🛡️  Admin created.');

    // ── 3. Teachers ──────────────────────────────────────────────────
    const teacher1 = await User.create({
      name: 'Teacher John',
      email: 'teacher1@school.com',
      password: 'password123',
      role: 'Teacher',
      assignedClasses: ['Grade 10-A', 'Grade 10-B'],
    });

    const teacher2 = await User.create({
      name: 'Teacher Priya',
      email: 'teacher2@school.com',
      password: 'password123',
      role: 'Teacher',
      assignedClasses: ['Grade 9-A', 'Grade 8-A'],
    });
    console.log('👨‍🏫 Teachers created.');

    // ── 4. Students & Parents (20 each) ──────────────────────────────
    const teachers = [teacher1, teacher2];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const idx = i + 1;

      // Convert student name to a safe email prefix
      const emailPrefix = s.name.toLowerCase().replace(/\s+/g, '.');

      // ── Create Parent User automatically ──
      const parent = await User.create({
        name: s.guardian,
        email: `parent.${emailPrefix}@school.com`,
        password: 'password123',
        role: 'Parent',
      });

      // ── Create Student User ──
      const studentUser = await User.create({
        name: s.name,
        email: `${emailPrefix}@school.com`,
        password: 'password123',
        role: 'Student',
        className: s.class,
        parentEmail: parent.email,
      });

      // ── Create Student Profile ──
      await Student.create({
        user: studentUser._id,
        admissionNumber: `ADM-${202400 + idx}`,
        class: s.class,
        dob: new Date(s.dob),
        guardianName: s.guardian,
        guardianPhone: s.guardianPhone,
        parentId: parent._id,
      });

      // ── Create Marks (one per subject) ──
      const assignedTeacher = s.class.includes('10') || s.class.includes('9')
        ? teachers[0]
        : teachers[1];

      for (const subj of subjects) {
        await Mark.create({
          student: studentUser._id,
          subject: subj,
          examName: 'Midterm',
          score: Math.floor(Math.random() * 30) + 65, // 65-94
          totalMarks: 100,
          teacher: assignedTeacher._id,
        });
      }

      // ── Create Fee records (Tuition + one random type) ──
      await Fee.create({
        student: studentUser._id,
        amount: 5000,
        type: 'Tuition',
        dueDate: new Date('2026-06-01'),
        status: i % 3 === 0 ? 'Paid' : i % 3 === 1 ? 'Unpaid' : 'Partially Paid',
        paidAt: i % 3 === 0 ? new Date('2026-05-01') : undefined,
      });

      const randomFeeType = feeTypes[Math.floor(Math.random() * feeTypes.length)];
      await Fee.create({
        student: studentUser._id,
        amount: 500 + Math.floor(Math.random() * 500),
        type: randomFeeType,
        dueDate: new Date('2026-07-01'),
        status: 'Unpaid',
      });

      console.log(`  ✅ Student ${idx}/20: ${s.name} + Parent: ${s.guardian}`);
    }

    // ── 5. Homework for each class ───────────────────────────────────
    const homeworkData = [
      { title: 'Algebra Worksheet',      description: 'Complete exercises 1-10 on page 45.',        subject: 'Mathematics',    class: 'Grade 10-A', teacher: teacher1._id, dueDate: '2026-05-15' },
      { title: 'Chemistry Lab Report',   description: 'Write the lab report for the acid-base experiment.', subject: 'Science', class: 'Grade 10-A', teacher: teacher1._id, dueDate: '2026-05-18' },
      { title: 'Essay on Freedom',       description: 'Write a 500-word essay on the meaning of freedom.', subject: 'English',  class: 'Grade 10-B', teacher: teacher1._id, dueDate: '2026-05-16' },
      { title: 'Geometry Problems',      description: 'Solve problems 1-15 from Chapter 7.',       subject: 'Mathematics',    class: 'Grade 10-B', teacher: teacher1._id, dueDate: '2026-05-20' },
      { title: 'History Chapter Summary', description: 'Summarize Chapter 5: The Mughal Empire.',   subject: 'Social Studies', class: 'Grade 9-A',  teacher: teacher2._id, dueDate: '2026-05-17' },
      { title: 'Hindi Poem Analysis',    description: 'Analyse the poem "Madhushala" by Harivansh Rai Bachchan.', subject: 'Hindi', class: 'Grade 9-A',  teacher: teacher2._id, dueDate: '2026-05-19' },
      { title: 'Science Project',        description: 'Build a working model of the solar system.', subject: 'Science',       class: 'Grade 8-A',  teacher: teacher2._id, dueDate: '2026-05-22' },
      { title: 'English Grammar',        description: 'Complete the tenses worksheet.',             subject: 'English',        class: 'Grade 8-A',  teacher: teacher2._id, dueDate: '2026-05-21' },
    ];

    for (const hw of homeworkData) {
      await Homework.create({
        ...hw,
        dueDate: new Date(hw.dueDate),
      });
    }
    console.log('📝 Homework assignments created.');

    // ── Summary ──────────────────────────────────────────────────────
    console.log('\n🎉 ═══════════════════════════════════════════');
    console.log('   Database Seeded Successfully!');
    console.log('   • 1 Principal');
    console.log('   • 1 Admin');
    console.log('   • 2 Teachers');
    console.log('   • 20 Students (with profiles)');
    console.log('   • 20 Parents (auto-created)');
    console.log('   • 100 Mark records (5 subjects × 20 students)');
    console.log('   • 40 Fee records (2 per student)');
    console.log('   • 8 Homework assignments');
    console.log('═══════════════════════════════════════════════\n');
    console.log('🔑 Login credentials (all users): password123');
    console.log('   Principal: principal@school.com');
    console.log('   Admin:     admin1@school.com');
    console.log('   Teacher:   teacher1@school.com / teacher2@school.com');
    console.log('   Student:   aarav.sharma@school.com (example)');
    console.log('   Parent:    parent.aarav.sharma@school.com (example)\n');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

importData();

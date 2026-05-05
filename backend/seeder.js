const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Homework = require('./src/models/Homework');
const Mark = require('./src/models/Mark');
const Fee = require('./src/models/Fee');

// Load env vars
dotenv.config();

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

    // 1. Create Principal
    const principal = await User.create({
      name: 'Principal Sarah',
      email: 'principal@school.com',
      password: 'password123',
      role: 'Principal',
    });

    // 2. Create Admins
    const admin1 = await User.create({
      name: 'Admin One',
      email: 'admin1@school.com',
      password: 'password123',
      role: 'Admin',
    });

    // 3. Create Teachers
    const teacher1 = await User.create({
      name: 'Teacher John',
      email: 'teacher1@school.com',
      password: 'password123',
      role: 'Teacher',
    });

    // 4. Create Students and Parents
    for (let i = 1; i <= 5; i++) {
      // Create Parent first
      const parent = await User.create({
        name: `Parent ${i}`,
        email: `parent${i}@school.com`,
        password: 'password123',
        role: 'Parent',
      });

      // Create Student User
      const studentUser = await User.create({
        name: `Student ${i}`,
        email: `student${i}@school.com`,
        password: 'password123',
        role: 'Student',
      });

      // Create Student Profile linking to Parent
      await Student.create({
        user: studentUser._id,
        admissionNumber: `ADM-${202400 + i}`,
        class: 'Grade 10-A',
        parentId: parent._id
      });

      // Create some Marks for each student
      await Mark.create({
        student: studentUser._id,
        subject: 'Mathematics',
        examName: 'Midterm',
        score: 80 + i,
        totalMarks: 100,
        teacher: teacher1._id
      });

      // Create a Fee record
      await Fee.create({
        student: studentUser._id,
        amount: 500,
        type: 'Tuition',
        dueDate: new Date('2026-06-01'),
        status: i % 2 === 0 ? 'Paid' : 'Unpaid'
      });
    }

    // 5. Create some Homework
    await Homework.create({
      title: 'Algebra Worksheet',
      description: 'Complete exercises 1-10 on page 45.',
      subject: 'Mathematics',
      dueDate: new Date('2026-05-10'),
      class: 'Grade 10-A',
      teacher: teacher1._id
    });

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

importData();

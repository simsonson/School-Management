const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const principalRoutes = require('./routes/principalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('School Management API is running...');
});

app.use(errorHandler);

module.exports = app;

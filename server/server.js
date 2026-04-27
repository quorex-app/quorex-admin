require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const emailRoutes = require('./routes/emails');
const scaleRoutes = require('./routes/scale');
const teamRoutes = require('./routes/team');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/scale', scaleRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/dashboard', dashboardRoutes);

const prisma = require('./db/prisma');

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

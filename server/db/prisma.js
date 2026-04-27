const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

module.exports = prisma;

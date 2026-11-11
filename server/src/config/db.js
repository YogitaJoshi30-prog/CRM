const path = require('path');
let PrismaClient;
try {
  PrismaClient = require(path.join(__dirname, '../../../node_modules/@prisma/client')).PrismaClient;
} catch (e) {
  PrismaClient = require('@prisma/client').PrismaClient;
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;

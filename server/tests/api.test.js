const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const http = require('http');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`🧪 Test server started on ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

// Helper for making API requests in tests
async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token && { Authorization: `Bearer ${options.token}` }),
    ...options.headers
  };

  const config = {
    method: options.method || 'GET',
    headers
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

test('1. Health Check Endpoint', async () => {
  const { status, data } = await request('/api/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'UP');
});

test('2. Authentication - Invalid Login Rejection', async () => {
  const { status, data } = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'invalid@drisu-demo.local', password: 'WrongPassword123' }
  });
  assert.equal(status, 401);
  assert.equal(data.success, false);
});

test('3. Authentication & JWT Token Issuance - Valid Admin Login', async () => {
  const { status, data } = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@drisu-demo.local', password: 'Demo@123456' }
  });
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.role, 'ADMIN');
});

test('4. Authorization - Unauthenticated Access to Protected Endpoint', async () => {
  const { status } = await request('/api/cases');
  assert.equal(status, 401);
});

test('5. Client Data Isolation - Client Login & Isolated Query', async () => {
  // Login as Client 1
  const clientLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'client1@drisu-demo.local', password: 'Demo@123456' }
  });
  assert.equal(clientLogin.status, 200);
  const clientToken = clientLogin.data.token;

  // Request cases list as client
  const { status, data } = await request('/api/cases', { token: clientToken });
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.cases));

  // Verify all returned cases belong to Client 1
  data.cases.forEach(c => {
    assert.equal(c.client.companyName, 'Apex Manufacturing Pvt Ltd');
  });
});

test('6. Mandatory Rejection Reason Requirement on Document Review', async () => {
  // Login as Staff 1
  const staffLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'staff1@drisu-demo.local', password: 'Demo@123456' }
  });
  const staffToken = staffLogin.data.token;

  // Attempt to reject a document without providing a comment
  const { status, data } = await request('/api/documents/non-existent-id/review', {
    method: 'PUT',
    token: staffToken,
    body: { status: 'REJECTED', reviewComment: '' }
  });

  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.match(data.message, /Rejection reason is mandatory/i);
});

test('7. Payment Financial Arithmetic - Outstanding Calculation', async () => {
  // Login as Admin
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@drisu-demo.local', password: 'Demo@123456' }
  });
  const adminToken = adminLogin.data.token;

  // Get cases
  const { data: casesData } = await request('/api/cases', { token: adminToken });
  const testCase = casesData.cases[0];

  assert.ok(testCase);
  const expectedOutstanding = Number(testCase.totalFee) - Number(testCase.amountPaid);
  assert.equal(Number(testCase.outstandingAmount), Math.max(0, expectedOutstanding));
});

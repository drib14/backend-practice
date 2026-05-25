const http = require('http');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from server/.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const PORT = 5000;
const TEST_EMAIL = `velocetest_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password1234';

console.log('======================================================');
console.log('🧪 RUNNING VELOCE MERN AUTHENTICATION E2E TEST SUITE');
console.log('======================================================\n');

// HTTP Helper to perform JSON requests easily
function makeRequest(apiPath, method, body, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      host: 'localhost',
      port: PORT,
      path: apiPath,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  let dbConnection = null;
  try {
    // Connect to MongoDB directly to extract generated OTP codes dynamically
    console.log('🔗 Connecting directly to MongoDB to inspect OTP codes...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://sheikha:sheikha@ac-widk2dh-shard-00-00.5sycajj.mongodb.net:27017/FixConnect?ssl=true&replicaSet=atlas-p74rb7-shard-0&authSource=admin';
    dbConnection = await mongoose.connect(mongoUri);
    const User = require('./models/User');
    console.log('✅ Connected to MongoDB successfully.');
    console.log('');

    let token = null;

    // 1. REGISTER TEST USER
    console.log('👉 [Test 1] POST /api/auth/register...');
    const registerRes = await makeRequest('/api/auth/register', 'POST', {
      name: 'Veloce QA Engineer',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      acceptedTerms: true
    });

    console.log('STATUS:', registerRes.status);
    console.log('RESPONSE:', registerRes.data);
    console.log('');

    if (registerRes.status !== 201) {
      throw new Error('Registration endpoint failed!');
    }

    // 2. FETCH OTP CODE FROM MONGODB
    console.log('🔍 [Test 2] Querying OTP verification code from database...');
    const createdUser = await User.findOne({ email: TEST_EMAIL });
    if (!createdUser) {
      throw new Error('User was not saved to MongoDB!');
    }

    const verificationCode = createdUser.verificationCode;
    console.log(`FOUND OTP CODE: ${verificationCode}`);
    console.log('');

    // 3. VERIFY EMAIL
    console.log('👉 [Test 3] POST /api/auth/verify-email...');
    const verifyRes = await makeRequest('/api/auth/verify-email', 'POST', {
      email: TEST_EMAIL,
      code: verificationCode
    });

    console.log('STATUS:', verifyRes.status);
    console.log('RESPONSE:', verifyRes.data);
    console.log('');

    if (verifyRes.status !== 200) {
      throw new Error('Verification endpoint failed!');
    }

    token = verifyRes.data.token;

    // 4. LOGIN USER
    console.log('👉 [Test 4] POST /api/auth/login...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log('STATUS:', loginRes.status);
    console.log('RESPONSE:', loginRes.data);
    console.log('');

    if (loginRes.status !== 200) {
      throw new Error('Login endpoint failed!');
    }

    // 5. GET PROFILE (GET /me)
    console.log('👉 [Test 5] GET /api/auth/me (Protected)...');
    const profileRes = await makeRequest('/api/auth/me', 'GET', null, token);

    console.log('STATUS:', profileRes.status);
    console.log('RESPONSE:', profileRes.data);
    console.log('');

    if (profileRes.status !== 200) {
      throw new Error('Profile fetch failed!');
    }

    // CLEANUP - Delete user from DB so we don't leave mess
    console.log('🧹 Cleaning up test user records from MongoDB...');
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('User records removed.');
    console.log('');

    console.log('======================================================');
    console.log('🎉 ALL VELOCE MERN AUTH E2E TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================');

  } catch (error) {
    console.error('❌ TEST RUN ENCOUNTERED AN ERROR:', error.message);
    process.exit(1);
  } finally {
    if (dbConnection) {
      await mongoose.connection.close();
    }
  }
}

runTests();

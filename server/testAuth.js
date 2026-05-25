require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const API_URL = `http://localhost:${process.env.PORT || 5000}/api/auth`;

async function runTests() {
  console.log('==================================================');
  console.log('STARTING AUTOMATED KEYSHIEN AUTH INTEGRATION TESTS');
  console.log('==================================================');

  // Connect directly to Database to clean up and fetch recovery codes
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB for test orchestration');
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const testEmail = 'testauth@keyshien.com';

  // Clean up existing test user
  await User.deleteOne({ email: testEmail });
  console.log(`✓ Cleaned up any old test accounts for ${testEmail}`);

  try {
    // Test 1: Register User (Enforces immediate verification)
    console.log('\n--- Test 1: Registering new user... ---');
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lovely Keyshien User',
        email: testEmail,
        password: 'securepassword123',
        acceptedTerms: true,
      }),
    });
    const regData = await regRes.json();
    console.log('Response Status:', regRes.status);
    console.log('Response Body:', regData);

    if (regRes.status !== 201) {
      throw new Error('Registration failed');
    }

    // Test 2: Login User (Should succeed immediately without verification locks)
    console.log('\n--- Test 2: Attempting immediate login after registration... ---');
    const logRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123',
      }),
    });
    const logData = await logRes.json();
    console.log('Response Status:', logRes.status);
    console.log('Response Body:', logData);

    if (logRes.status !== 200 || logData.status !== 'success') {
      throw new Error('Expected login to succeed immediately');
    }
    const token = logData.token;
    console.log('✓ Token obtained:', token.substring(0, 20) + '...');

    // Test 3: Access protected Profile endpoint
    console.log('\n--- Test 3: Testing protected /me route... ---');
    const meRes = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const meData = await meRes.json();
    console.log('Response Status:', meRes.status);
    console.log('Response Body:', meData);

    if (meRes.status !== 200) {
      throw new Error('Accessing protected route failed');
    }

    // Test 4: Forgot Password (OTP starts here!)
    console.log('\n--- Test 4: Triggering Forgot Password OTP flow... ---');
    const forgotRes = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
      }),
    });
    const forgotData = await forgotRes.json();
    console.log('Response Status:', forgotRes.status);
    console.log('Response Body:', forgotData);

    if (forgotRes.status !== 200) {
      throw new Error('Forgot password recovery trigger failed');
    }

    // Fetch the 6-digit reset OTP code from the Database programmatically
    const dbUserReset = await User.findOne({ email: testEmail });
    const resetOtp = dbUserReset.resetPasswordCode;
    console.log(`✓ Programmatically retrieved reset OTP from MongoDB: [${resetOtp}]`);

    // Test 5: Reset Password using the 6-digit OTP code
    console.log('\n--- Test 5: Resetting password using OTP code... ---');
    const resetRes = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        code: resetOtp,
        newPassword: 'newkeyshienpassword789',
      }),
    });
    const resetData = await resetRes.json();
    console.log('Response Status:', resetRes.status);
    console.log('Response Body:', resetData);

    if (resetRes.status !== 200) {
      throw new Error('Password reset using recovery OTP failed');
    }

    // Test 6: Login with New Password
    console.log('\n--- Test 6: Logging in with the newly reset password... ---');
    const newLogRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'newkeyshienpassword789',
      }),
    });
    const newLogData = await newLogRes.json();
    console.log('Response Status:', newLogRes.status);
    console.log('Response Body:', newLogData);

    if (newLogRes.status !== 200) {
      throw new Error('Login with new reset password failed');
    }

    console.log('\n==================================================');
    console.log('🎉 ALL KEYSHIEN INTEGRATION TESTS PASSED SUCCESSFULY! 🎉');
    console.log('==================================================');
  } catch (err) {
    console.error('\n✗ TEST RUN FAILED:', err.message);
  } finally {
    // Close DB Connection
    await mongoose.connection.close();
    console.log('\n✓ Closed database connection');
  }
}

// Run the tests
runTests();

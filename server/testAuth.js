require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const API_URL = `http://localhost:${process.env.PORT || 5000}/api/auth`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('==================================================');
  console.log('STARTING AUTOMATED AUTH END-TO-END INTEGRATION TEST');
  console.log('==================================================');

  // 1. Connect directly to Database to clean up and fetch codes
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB for test orchestration');
  } catch (err) {
    console.error('✗ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  const testEmail = 'testauth@veloce.com';

  // Clean up existing test user
  await User.deleteOne({ email: testEmail });
  console.log(`✓ Cleaned up any old test accounts for ${testEmail}`);

  // Start the tests
  try {
    // Test 1: Register User
    console.log('\n--- Test 1: Registering new user... ---');
    const regRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Auth User',
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

    // Test 2: Attempt Login (Should fail with 'unverified' status)
    console.log('\n--- Test 2: Attempting login before verification (Should return unverified status)... ---');
    const logUnvRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'securepassword123',
      }),
    });
    const logUnvData = await logUnvRes.json();
    console.log('Response Status:', logUnvRes.status);
    console.log('Response Body:', logUnvData);

    if (logUnvData.status !== 'unverified') {
      throw new Error('Expected login to fail with unverified status');
    }

    // Fetch the OTP from the Database programmatically
    const dbUser = await User.findOne({ email: testEmail });
    const otp = dbUser.verificationCode;
    console.log(`✓ Programmatically retrieved verification OTP from MongoDB: [${otp}]`);

    // Test 3: Verify Email
    console.log('\n--- Test 3: Verifying email using OTP code... ---');
    const verifyRes = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        code: otp,
      }),
    });
    const verifyData = await verifyRes.json();
    console.log('Response Status:', verifyRes.status);
    console.log('Response Body:', verifyData);

    if (verifyRes.status !== 200) {
      throw new Error('Email verification failed');
    }
    const token = verifyData.token;
    console.log('✓ Token obtained:', token.substring(0, 20) + '...');

    // Test 4: Access protected Profile endpoint
    console.log('\n--- Test 4: Testing protected /me route... ---');
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

    // Test 5: Forgot Password
    console.log('\n--- Test 5: Triggering Forgot Password flow... ---');
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
      throw new Error('Forgot password request failed');
    }

    // Fetch the reset code from the Database programmatically
    const dbUserReset = await User.findOne({ email: testEmail });
    const resetOtp = dbUserReset.resetPasswordCode;
    console.log(`✓ Programmatically retrieved reset OTP from MongoDB: [${resetOtp}]`);

    // Test 6: Reset Password
    console.log('\n--- Test 6: Resetting password using OTP code... ---');
    const resetRes = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        code: resetOtp,
        newPassword: 'newsecurepassword789',
      }),
    });
    const resetData = await resetRes.json();
    console.log('Response Status:', resetRes.status);
    console.log('Response Body:', resetData);

    if (resetRes.status !== 200) {
      throw new Error('Password reset failed');
    }

    // Test 7: Login with New Password
    console.log('\n--- Test 7: Logging in with the new password... ---');
    const newLogRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'newsecurepassword789',
      }),
    });
    const newLogData = await newLogRes.json();
    console.log('Response Status:', newLogRes.status);
    console.log('Response Body:', newLogData);

    if (newLogRes.status !== 200) {
      throw new Error('Login with new password failed');
    }

    console.log('\n==================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULY! 🎉');
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

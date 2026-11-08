// Comprehensive automated test suite for FoodRescue API & workflows
const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('🚀 Running FoodRescue Automated Test Suite...\n');

  // Test 1: Health check
  console.log('Test 1: Health & Public Stats');
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health check returns 200 OK');

  const stats = await request('/stats/public-summary');
  assert(stats.status === 200 && stats.data.stats.totalMealsRescued > 0, 'Public stats summary returns calculated metrics');

  // Test 2: Role Logins
  console.log('\nTest 2: Role Authentications');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@foodrescue.org', password: 'Admin@123' },
  });
  assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', 'Admin user logs in successfully');
  const adminToken = adminLogin.data.token;

  const donorLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'donor.green@foodrescue.org', password: 'Donor@123' },
  });
  assert(donorLogin.status === 200 && donorLogin.data.user.role === 'DONOR', 'Donor user logs in successfully');
  const donorToken = donorLogin.data.token;

  const verifiedNgoLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'ngo.hope@foodrescue.org', password: 'Ngo@123' },
  });
  assert(
    verifiedNgoLogin.status === 200 &&
    verifiedNgoLogin.data.user.role === 'NGO' &&
    verifiedNgoLogin.data.user.ngoProfile?.verificationStatus === 'VERIFIED',
    'Verified NGO logs in successfully with VERIFIED status'
  );
  const verifiedNgoToken = verifiedNgoLogin.data.token;

  const unverifiedNgoLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'ngo.new@foodrescue.org', password: 'Ngo@123' },
  });
  assert(
    unverifiedNgoLogin.status === 200 &&
    unverifiedNgoLogin.data.user.role === 'NGO' &&
    unverifiedNgoLogin.data.user.ngoProfile?.verificationStatus === 'PENDING',
    'Unverified NGO logs in with PENDING verification status'
  );
  const unverifiedNgoToken = unverifiedNgoLogin.data.token;

  // Test 3: Unverified NGO cannot request food
  console.log('\nTest 3: Authorization Boundary - Unverified NGO Restriction');
  const availableList = await request('/donations/available');
  assert(availableList.status === 200 && availableList.data.donations.length > 0, 'Public can view available donations');
  const targetDonation = availableList.data.donations[0];

  const unverifiedClaimAttempt = await request('/requests', {
    method: 'POST',
    token: unverifiedNgoToken,
    body: { donationId: targetDonation.id, notes: 'Attempt by unverified account' },
  });
  assert(
    unverifiedClaimAttempt.status === 403 && unverifiedClaimAttempt.data.isUnverifiedNgo === true,
    'Unverified NGO request blocked with 403 Forbidden and isUnverifiedNgo flag'
  );

  // Test 4: Admin verifies the unverified NGO
  console.log('\nTest 4: Admin Verification Workflow');
  const unverifiedProfileId = unverifiedNgoLogin.data.user.ngoProfile.id;
  const adminVerifyRes = await request(`/admin/ngos/${unverifiedProfileId}/verify`, {
    method: 'PATCH',
    token: adminToken,
    body: { status: 'VERIFIED', verificationNote: 'Audited and verified by integration test runner' },
  });
  assert(
    adminVerifyRes.status === 200 && adminVerifyRes.data.ngoProfile.verificationStatus === 'VERIFIED',
    'Admin successfully transitions NGO status from PENDING to VERIFIED'
  );

  // Re-fetch me to verify token sees updated status
  const meRefreshed = await request('/auth/me', { token: unverifiedNgoToken });
  assert(
    meRefreshed.status === 200 && meRefreshed.data.user.ngoProfile.verificationStatus === 'VERIFIED',
    'Newly verified NGO profile status immediately reflects in profile endpoint'
  );

  // Test 5: Donor creates a fresh donation listing
  console.log('\nTest 5: Full End-to-End Donation Lifecycle');
  const tomorrow = new Date(Date.now() + 24 * 3600000).toISOString();
  const prepTime = new Date().toISOString();

  const createDonationRes = await request('/donations', {
    method: 'POST',
    token: donorToken,
    body: {
      title: '100 Freshly Baked Croissants & Brioche',
      category: 'Bakery & Bread',
      quantity: '100 pieces in 4 boxes',
      description: 'Morning surplus baked goods from today.',
      dietaryInfo: 'Vegetarian, Contains Gluten & Butter',
      storageRequirement: 'Room Temperature',
      preparationDate: prepTime,
      collectionDeadline: tomorrow,
      pickupLocation: '452 Elm Street, Downtown Dining District',
      pickupInstructions: 'Enter kitchen door',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
    },
  });
  assert(createDonationRes.status === 201 && createDonationRes.data.donation.status === 'AVAILABLE', 'Donor creates listing (Status: AVAILABLE)');
  const newDonationId = createDonationRes.data.donation.id;

  // Test 6: Verified NGO claims this donation
  console.log('\nTest 6: NGO Submits Request');
  const submitClaimRes = await request('/requests', {
    method: 'POST',
    token: verifiedNgoToken,
    body: {
      donationId: newDonationId,
      requestedQuantity: '100 pieces',
      notes: 'For family breakfast distribution at shelter',
    },
  });
  assert(submitClaimRes.status === 201 && submitClaimRes.data.request.status === 'PENDING', 'Verified NGO submits request (Status: PENDING)');
  const requestId = submitClaimRes.data.request.id;

  // Verify donation status changed to REQUESTED
  const checkDonationAfterReq = await request(`/donations/${newDonationId}`);
  assert(checkDonationAfterReq.data.donation.status === 'REQUESTED', 'Donation status transitions to REQUESTED');

  // Test 7: Duplicate request prevention
  console.log('\nTest 7: Duplicate Request Prevention');
  const duplicateClaimAttempt = await request('/requests', {
    method: 'POST',
    token: verifiedNgoToken,
    body: { donationId: newDonationId, requestedQuantity: '100 pieces' },
  });
  assert(duplicateClaimAttempt.status === 409, 'Duplicate request prevented with 409 Conflict');

  // Test 8: Donor approves the request
  console.log('\nTest 8: Donor Approves Request');
  const approveRes = await request(`/requests/${requestId}/status`, {
    method: 'PATCH',
    token: donorToken,
    body: {
      action: 'APPROVE',
      donorResponseNote: 'Approved. Boxes ready at back ramp.',
    },
  });
  assert(approveRes.status === 200 && approveRes.data.request.status === 'APPROVED', 'Donor approves request (Status: APPROVED)');

  // Verify donation status moved to APPROVED
  const checkDonationApproved = await request(`/donations/${newDonationId}`);
  assert(checkDonationApproved.data.donation.status === 'APPROVED', 'Donation status transitions to APPROVED');

  // Test 9: Collection confirmation (COLLECT)
  console.log('\nTest 9: Collection Handover Confirmation');
  const collectRes = await request(`/requests/${requestId}/status`, {
    method: 'PATCH',
    token: donorToken,
    body: { action: 'COLLECT' },
  });
  assert(collectRes.status === 200 && collectRes.data.request.status === 'COLLECTED', 'Collection confirmed (Status: COLLECTED)');

  // Test 10: Complete Cycle (COMPLETE)
  console.log('\nTest 10: Complete Cycle');
  const completeRes = await request(`/requests/${requestId}/status`, {
    method: 'PATCH',
    token: donorToken,
    body: { action: 'COMPLETE' },
  });
  assert(completeRes.status === 200 && completeRes.data.request.status === 'COMPLETED', 'Donation cycle completed (Status: COMPLETED)');

  const finalDonationCheck = await request(`/donations/${newDonationId}`);
  assert(finalDonationCheck.data.donation.status === 'COMPLETED', 'Donation record permanently marked COMPLETED in database');

  // Test 11: Admin stats reflect changes
  console.log('\nTest 11: Admin Stats Verification');
  const adminStatsAfter = await request('/admin/stats', { token: adminToken });
  assert(
    adminStatsAfter.status === 200 && adminStatsAfter.data.stats.completedDonations >= 2,
    'Admin statistics accurately reflect newly completed donation cycle'
  );

  console.log('\n🎉 ALL 11 TESTS PASSED PERFECTLY WITH ZERO ERRORS!');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});


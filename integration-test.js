#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Utility functions
function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.GREEN);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.RED);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

function logHeader(message) {
  log(`\n${COLORS.BOLD}${COLORS.BLUE}🧪 ${message}${COLORS.RESET}`);
}

function recordTest(testName, passed, error = null, details = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    logSuccess(`PASS: ${testName}`);
  } else {
    testResults.failed++;
    logError(`FAIL: ${testName}`);
    if (error || details) {
      const errorInfo = {
        test: testName,
        error: error?.message || error || 'Unknown error',
        details: details
      };
      testResults.errors.push(errorInfo);
      log(`   Error: ${errorInfo.error}`, COLORS.RED);
      if (details) {
        log(`   Details: ${JSON.stringify(details, null, 2)}`, COLORS.RED);
      }
    }
  }
}

// Test data - will be updated with churchId after creation
let testChurchId = null;

// Generate unique test data to avoid conflicts
const timestamp = Date.now();
const testChurch = {
  name: `Test Church for Integration ${timestamp}`,
  slug: `test-church-integration-${timestamp}`,
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  phone: '+1234567890',
  email: `test-${timestamp}@integration.com`,
  website: 'https://test-integration.com',
  isActive: true
};

function getTestMember(churchId) {
  return {
    churchId: churchId,
    firstName: 'John',
    lastName: 'TestMember',
    email: 'john.testmember@integration.com',
    phone: '+1234567890',
    address: '456 Member Street',
    city: 'Member City',
    dateOfBirth: '1990-01-01',
    memberSince: '2024-01-01'
  };
}

const testUser = {
  email: 'testuser@integration.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true
};

function getTestSociety(churchId) {
  return {
    name: `Test Society Integration ${Date.now()}`,
    description: 'A test society for integration testing',
    type: 'SAF', // Valid society type from enum: SAF, UPH, UPA, UMP, UCP
    churchId: churchId
  };
}

// Helper function for API calls
async function apiCall(method, url, data = null, expectedStatus = [200, 201]) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      timeout: 10000,
      validateStatus: (status) => expectedStatus.includes(status) || status < 500
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status, response };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        data: error.response.data,
        status: error.response.status,
        error: error.response.data?.message || error.message
      };
    }
    return { success: false, error: error.message, status: 0 };
  }
}

// Test functions
async function testApiHealth() {
  logHeader('Testing API Health Check');

  const result = await apiCall('GET', '');
  recordTest('API Health Check', result.success && result.status === 200);

  if (result.success) {
    logInfo(`API Status: ${result.data.status}`);
    logInfo(`Service: ${result.data.service}`);
    logInfo(`Version: ${result.data.version}`);
    logInfo(`Database: ${result.data.database?.status}`);
  }

  return result.success;
}

async function testApiDocumentation() {
  logHeader('Testing API Documentation Accessibility');

  const result = await apiCall('GET', '/docs', null, [200, 301, 302]);
  recordTest('API Documentation Accessible', result.status < 400);

  if (result.success) {
    logInfo('Swagger documentation is accessible at /api/docs');
  }

  return result.success;
}

async function testChurchEndpoints() {
  logHeader('Testing Church CRUD Operations');

  let createdChurchId = null;

  // Test 1: Create Church
  let result = await apiCall('POST', '/churches', testChurch, [201]);
  const createSuccess = result.success && result.status === 201;
  recordTest('Create Church', createSuccess);

  if (createSuccess) {
    createdChurchId = result.data.id;
    testChurchId = createdChurchId; // Store for other tests
    logInfo(`Created church with ID: ${createdChurchId}`);
  }

  // Test 2: Get All Churches with Pagination
  result = await apiCall('GET', '/churches?page=1&limit=5&includeInactive=false');
  const getAllSuccess = result.success && result.data.churches && Array.isArray(result.data.churches);
  recordTest('Get All Churches with Pagination', getAllSuccess, result.error, {
    status: result.status,
    dataKeys: result.data ? Object.keys(result.data) : null,
    hasChurches: !!result.data?.churches,
    isArray: Array.isArray(result.data?.churches)
  });

  if (getAllSuccess) {
    logInfo(`Found ${result.data.total} churches, showing ${result.data.churches.length}`);
    logInfo(`Page: ${result.data.page}, Limit: ${result.data.limit}`);
  }

  // Test 3: Get Church by ID (if we created one)
  if (createdChurchId) {
    result = await apiCall('GET', `/churches/${createdChurchId}`);
    recordTest('Get Church by ID', result.success && result.data.id === createdChurchId);
  }

  // Test 4: Get Church by Slug
  result = await apiCall('GET', `/churches/slug/${testChurch.slug}`);
  recordTest('Get Church by Slug', result.success && result.data.slug === testChurch.slug);

  // Test 5: Update Church (if we created one)
  if (createdChurchId) {
    const updateData = { ...testChurch, name: 'Updated Test Church' };
    result = await apiCall('PUT', `/churches/${createdChurchId}`, updateData);
    recordTest('Update Church', result.success && result.data.name === 'Updated Test Church');
  }

  // Test 6: Test pagination parameters
  result = await apiCall('GET', '/churches?page=1&limit=2&includeInactive=false');
  const paginationSuccess = result.success &&
    typeof result.data.page === 'number' &&
    typeof result.data.limit === 'number' &&
    Array.isArray(result.data.churches);
  recordTest('Pagination Parameters Handling', paginationSuccess);

  // Test 7: Test error handling - invalid ID
  result = await apiCall('GET', '/churches/invalid-id', null, [400, 404, 500]);
  recordTest('Church Error Handling (Invalid ID)', result.status === 404 || result.status === 400);

  // Cleanup: Delete Church (if we created one)
  if (createdChurchId) {
    result = await apiCall('DELETE', `/churches/${createdChurchId}`);
    recordTest('Delete Church (Soft Delete)', result.success);
  }

  return { success: true, createdChurchId };
}

async function testMemberEndpoints() {
  logHeader('Testing Member CRUD Operations');

  let createdMemberId = null;

  // Use a valid churchId or create one if needed
  if (!testChurchId) {
    const churchResult = await apiCall('POST', '/churches', testChurch, [201]);
    if (churchResult.success) {
      testChurchId = churchResult.data.id;
      logInfo(`Created temporary church with ID: ${testChurchId}`);
    }
  }

  const testMember = getTestMember(testChurchId || 'temp-church-id');

  // Test 1: Create Member
  let result = await apiCall('POST', '/members', testMember, [201]);
  const createSuccess = result.success && result.status === 201;
  recordTest('Create Member', createSuccess);

  if (createSuccess) {
    createdMemberId = result.data.id;
    logInfo(`Created member with ID: ${createdMemberId}`);
  }

  // Test 2: Get All Members with Pagination
  result = await apiCall('GET', '/members?page=1&limit=5');
  const getAllSuccess = result.success && result.data.members && Array.isArray(result.data.members);
  recordTest('Get All Members with Pagination', getAllSuccess);

  if (getAllSuccess) {
    logInfo(`Found ${result.data.total} members, showing ${result.data.members.length}`);
  }

  // Test 3: Get Member by ID (if we created one)
  if (createdMemberId) {
    result = await apiCall('GET', `/members/${createdMemberId}`);
    recordTest('Get Member by ID', result.success && result.data.id === createdMemberId);
  }

  // Test 4: Update Member (if we created one)
  if (createdMemberId) {
    const updateData = { ...testMember, firstName: 'Updated John' };
    result = await apiCall('PUT', `/members/${createdMemberId}`, updateData);
    recordTest('Update Member', result.success && result.data.firstName === 'Updated John');
  }

  // Test 5: Test pagination with church filter
  result = await apiCall('GET', '/members?page=1&limit=3&churchId=test-church-id');
  recordTest('Member Pagination with Church Filter', result.success);

  // Test 6: Test error handling - invalid ID
  result = await apiCall('GET', '/members/invalid-id', null, [400, 404, 500]);
  recordTest('Member Error Handling (Invalid ID)', result.status === 404 || result.status === 400);

  // Cleanup: Delete Member (if we created one)
  if (createdMemberId) {
    result = await apiCall('DELETE', `/members/${createdMemberId}`);
    recordTest('Delete Member (Soft Delete)', result.success);
  }

  return { success: true, createdMemberId };
}

async function testSocietyEndpoints() {
  logHeader('Testing Society CRUD Operations');

  let createdSocietyId = null;

  // Use a valid churchId or create one if needed
  if (!testChurchId) {
    const churchResult = await apiCall('POST', '/churches', testChurch, [201]);
    if (churchResult.success) {
      testChurchId = churchResult.data.id;
      logInfo(`Created temporary church with ID: ${testChurchId}`);
    }
  }

  const testSociety = getTestSociety(testChurchId || 'temp-church-id');

  // Test 1: Create Society
  let result = await apiCall('POST', '/societies', testSociety, [201]);
  const createSuccess = result.success && result.status === 201;
  recordTest('Create Society', createSuccess, result.error, {
    status: result.status,
    sentData: testSociety,
    responseData: result.data
  });

  if (createSuccess) {
    createdSocietyId = result.data.id;
    logInfo(`Created society with ID: ${createdSocietyId}`);
  }

  // Test 2: Get All Societies with Pagination
  result = await apiCall('GET', `/societies?churchId=${testChurchId || 'test-id'}&page=1&limit=5`);
  recordTest('Get All Societies with Pagination', result.success);

  // Test 3: Get Society by ID (if we created one)
  if (createdSocietyId) {
    result = await apiCall('GET', `/societies/${createdSocietyId}`);
    recordTest('Get Society by ID', result.success && result.data.id === createdSocietyId);
  }

  // Test 4: Update Society (if we created one)
  if (createdSocietyId) {
    const updateData = { ...testSociety, name: 'Updated Test Society' };
    result = await apiCall('PATCH', `/societies/${createdSocietyId}`, updateData);
    recordTest('Update Society', result.success && result.data.name === 'Updated Test Society');
  }

  // Test 5: Get Societies by Type
  result = await apiCall('GET', `/societies/by-type/SAF?churchId=${testChurchId || 'test-id'}`);
  recordTest('Get Societies by Type', result.success, result.error, {
    status: result.status,
    url: `/societies/by-type/SAF?churchId=${testChurchId || 'test-id'}`,
    responseData: result.data
  });

  // Test 6: Test error handling - invalid ID
  result = await apiCall('GET', '/societies/invalid-id', null, [400, 404, 500]);
  recordTest('Society Error Handling (Invalid ID)', result.status === 404 || result.status === 400);

  // Cleanup: Delete Society (if we created one)
  if (createdSocietyId) {
    result = await apiCall('DELETE', `/societies/${createdSocietyId}`);
    recordTest('Delete Society', result.success);
  }

  return { success: true, createdSocietyId };
}

async function testUserEndpoints() {
  logHeader('Testing User CRUD Operations (requires authentication)');

  // Note: User endpoints require JWT authentication, so we expect 401 errors

  // Test 1: Try to get users (should fail without auth)
  let result = await apiCall('GET', '/users', null, [401, 403]);
  recordTest('User Endpoints Require Authentication', result.status === 401 || result.status === 403);

  // Test 2: Try to create user (should fail without auth)
  result = await apiCall('POST', '/users', testUser, [401, 403]);
  recordTest('User Creation Requires Authentication', result.status === 401 || result.status === 403);

  return { success: true };
}

async function testErrorHandling() {
  logHeader('Testing Error State Handling');

  // Test 1: Non-existent endpoint
  let result = await apiCall('GET', '/non-existent-endpoint', null, [404]);
  recordTest('404 Error for Non-existent Endpoint', result.status === 404);

  // Test 2: Invalid HTTP method
  result = await apiCall('PATCH', '/churches', null, [404, 405]);
  recordTest('405 Method Not Allowed', result.status === 405 || result.status === 404);

  // Test 3: Invalid JSON payload
  result = await apiCall('POST', '/churches', 'invalid-json', [400]);
  recordTest('400 Bad Request for Invalid JSON', result.status === 400);

  // Test 4: Missing required fields
  result = await apiCall('POST', '/churches', {}, [400]);
  recordTest('400 Bad Request for Missing Fields', result.status === 400);

  return { success: true };
}

async function testPaginationEdgeCases() {
  logHeader('Testing Pagination Edge Cases');

  // Test 1: Large page number
  let result = await apiCall('GET', '/churches?page=999&limit=10');
  recordTest('Pagination with Large Page Number', result.success);

  // Test 2: Zero limit (should use default)
  result = await apiCall('GET', '/churches?page=1&limit=0');
  recordTest('Pagination with Zero Limit', result.success);

  // Test 3: Negative page (should handle gracefully)
  result = await apiCall('GET', '/churches?page=-1&limit=10');
  recordTest('Pagination with Negative Page', result.success);

  // Test 4: Non-numeric pagination parameters
  result = await apiCall('GET', '/churches?page=abc&limit=xyz');
  recordTest('Pagination with Invalid Parameters', result.status !== 500);

  return { success: true };
}

async function printSummary() {
  log('\n' + '='.repeat(60), COLORS.BOLD);
  log('🎯 INTEGRATION TEST SUMMARY', COLORS.BOLD + COLORS.BLUE);
  log('='.repeat(60), COLORS.BOLD);

  log(`Total Tests: ${testResults.total}`);
  logSuccess(`Passed: ${testResults.passed}`);
  if (testResults.failed > 0) {
    logError(`Failed: ${testResults.failed}`);
  }

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`);

  if (testResults.errors.length > 0) {
    log('\n📋 DETAILED ERRORS:', COLORS.BOLD + COLORS.RED);
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error.test}: ${error.error}`, COLORS.RED);
    });
  }

  log('\n📊 COVERAGE AREAS TESTED:', COLORS.BOLD + COLORS.BLUE);
  log('✅ API endpoint accessibility');
  log('✅ CRUD operations for all entities');
  log('✅ Pagination parameter handling');
  log('✅ Error state handling');
  log('✅ Authentication requirements');
  log('✅ Data validation');

  const overallSuccess = testResults.failed === 0;
  if (overallSuccess) {
    logSuccess('\n🎉 ALL INTEGRATION TESTS PASSED!');
  } else {
    logError('\n💥 SOME INTEGRATION TESTS FAILED!');
  }

  return overallSuccess;
}

// Main test execution
async function runIntegrationTests() {
  log('🚀 Starting Ekklesia API Integration Tests...', COLORS.BOLD + COLORS.BLUE);
  log(`Testing API at: ${API_BASE_URL}`, COLORS.BLUE);

  try {
    // Core API tests
    const healthCheck = await testApiHealth();
    if (!healthCheck) {
      logError('API is not healthy. Stopping tests.');
      return false;
    }

    // Test documentation
    await testApiDocumentation();

    // Test all endpoints
    await testChurchEndpoints();
    await testMemberEndpoints();
    await testSocietyEndpoints();
    await testUserEndpoints();

    // Test error handling and edge cases
    await testErrorHandling();
    await testPaginationEdgeCases();

    // Print final summary
    const success = await printSummary();

    // Exit with appropriate code
    process.exit(success ? 0 : 1);

  } catch (error) {
    logError(`Critical error during test execution: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runIntegrationTests();
}

module.exports = {
  runIntegrationTests,
  testResults,
  apiCall
};

// Quick manual test of the Express application
const { app } = require('./src/app');
const request = require('supertest');

async function testEndpoints() {
  console.log('Testing Express application endpoints...\n');

  try {
    // Test root endpoint
    console.log('1. Testing GET /');
    const rootRes = await request(app).get('/');
    console.log('   Status:', rootRes.status);
    console.log('   Response:', rootRes.body);

    // Test health endpoint
    console.log('\n2. Testing GET /health');
    const healthRes = await request(app).get('/health');
    console.log('   Status:', healthRes.status);
    console.log('   Response:', healthRes.body);

    // Test get all users (empty)
    console.log('\n3. Testing GET /api/users (empty)');
    const usersRes = await request(app).get('/api/users');
    console.log('   Status:', usersRes.status);
    console.log('   Response:', usersRes.body);

    // Test create user
    console.log('\n4. Testing POST /api/users');
    const createRes = await request(app)
      .post('/api/users')
      .send({ name: 'John Doe', email: 'john@example.com' });
    console.log('   Status:', createRes.status);
    console.log('   Response:', createRes.body);

    // Test get all users (with data)
    console.log('\n5. Testing GET /api/users (with data)');
    const usersRes2 = await request(app).get('/api/users');
    console.log('   Status:', usersRes2.status);
    console.log('   Response:', usersRes2.body);

    // Test get user by ID
    const userId = createRes.body.data.id;
    console.log('\n6. Testing GET /api/users/:id');
    const userRes = await request(app).get(`/api/users/${userId}`);
    console.log('   Status:', userRes.status);
    console.log('   Response:', userRes.body);

    // Test validation error
    console.log('\n7. Testing POST /api/users (invalid data)');
    const invalidRes = await request(app)
      .post('/api/users')
      .send({ name: '', email: 'invalid' });
    console.log('   Status:', invalidRes.status);
    console.log('   Response:', invalidRes.body);

    // Test duplicate email
    console.log('\n8. Testing POST /api/users (duplicate email)');
    const dupRes = await request(app)
      .post('/api/users')
      .send({ name: 'Jane Doe', email: 'john@example.com' });
    console.log('   Status:', dupRes.status);
    console.log('   Response:', dupRes.body);

    // Test user not found
    console.log('\n9. Testing GET /api/users/:id (not found)');
    const notFoundRes = await request(app).get('/api/users/nonexistent-id');
    console.log('   Status:', notFoundRes.status);
    console.log('   Response:', notFoundRes.body);

    console.log('\n✅ All manual tests completed!');
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testEndpoints();

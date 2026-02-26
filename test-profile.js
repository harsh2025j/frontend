const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@example.com', // guess an email, or I need to create one
      password: 'password123'
    });
    console.log("Login:", Object.keys(loginRes.data));
  } catch (e) {
    console.error("error");
  }
}
test();

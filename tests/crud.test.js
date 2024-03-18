const request = require('supertest');

const app = require('../main');

describe('CRUD Tests', () => {
    test('read test should return employee', async () => {
        const res = await request(app).get('/employees');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].givenName).toBe("Doe");
        expect(res.body[0].email).toBe("user@email.com");
        expect(res.body[0].employeeID).toBe(1);
    });
    test('create test should post employee', async () => {
        const res = await request(app)
          .post('/employees/add')
          .auth('user1@email.com', 'password1')
          .set('Content-Type', 'text/plain');
        expect(res.statusCode).toBe(200);
        const successResponse = JSON.parse(res.text);
        expect(successResponse.status).toBe('ok');
        expect(successResponse.fragment.type).toBe('text/plain');
        expect(successResponse.fragment.size).toBe(0);
      });

});
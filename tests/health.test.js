const request = require('supertest');

const app = require('../main');

describe('/ health check', () => {
    test('should return HTTP 200 response', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    });

});

describe('CRUD Tests', () => {
    test('read test should return employee data', async () => {
        const res = await request(app).get('/employees');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].givenName).toBe("John");
        expect(res.body[0].surname).toBe("Caruso");
        expect(res.body[0].email).toBe("John.D@email.com");
        expect(res.body[0].employeeID).toBe(1);
    });
    test('create test should post employee', async () => {
        const res = await request(app)
          .post('/employees/add')
          .send({
            givenName: "Tester",
            surname: "Fellow",
            email: "tester@email.com",
            password: "123abc",
            SIN: "654321",
            addrStreet: "123 Tester Street",
            addrCity: "Toronto",
            addrProv: "ON",
            addrPostal: "1b1b1b",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
          });
        expect(res.statusCode).toBe(200);
        const successResponse = JSON.parse(res.text);
        expect(res.body[6].givenName).toBe('Tester');
        expect(res.body[6].surname).toBe('Fellow');
        expect(res.body[6].email).toBe('tester@email.com');
        console.log(successResponse)
      });
    test('update test should update employee', async () => {
        const employeeID = 7;
        const updatedEmployee = {
            givenName: "Updated",
            surname: "Fellow",
            email: "updated@email.com",
            password: "123abc",
            SIN: "654321",
            addrStreet: "123 Tester Street",
            addrCity: "Toronto",
            addrProv: "ON",
            addrPostal: "1b1b1b",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
        }
        const res = await request(app)
            .put(`/employees/update`)
            .send(updatedEmployee);
        expect(res.statusCode).toEqual(200);
        expect(res.body[6].givenName).toBe('Updated');
        expect(res.body[6].email).toBe('updated@email.com');
    })

});
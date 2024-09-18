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
        expect(res.body[1].givenName).toBe("John");
        expect(res.body[1].surname).toBe("Caruso");
        expect(res.body[1].email).toBe("John.D@email.com");
        expect(res.body[1].employeeID).toBe(7);
        const successResponse = JSON.parse(res.text);
        console.log(successResponse.length);
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
            addrPostal: "B1B1B1",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "New user added." });
      },10000);
      test('post failed, unique constraint error', async () => {
        const res = await request(app)
          .post('/employees/add')
          .send({
            givenName: "Tester",
            surname: "Fellow",
            email: "unique-tester@email.com",
            password: "123abc",
            SIN: "654321",
            addrStreet: "123 Tester Street",
            addrCity: "Toronto",
            addrProv: "ON",
            addrPostal: "B1B1B1",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "Failed to create Employee record for Fellow, Tester: SequelizeUniqueConstraintError: Validation error" });
      },10000);
    test('post attempt with postal code validation error', async () => {
        const res = await request(app)
        .post('/employees/add')
        .send({
          givenName: "invalid",
          surname: "invalid",
          email: "invalid@email.com",
          password: "123abc",
          SIN: "654321",
          addrStreet: "123 Tester Street",
          addrCity: "Toronto",
          addrProv: "ON",
          addrPostal: "invalid",
          status: "Active",
          department: 2,
          hireDate: "2024-03-22"
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrPostal failed" });
    })
    test('post attempt with city validation error', async () => {
        const res = await request(app)
        .post('/employees/add')
        .send({
          givenName: "invalid",
          surname: "invalid",
          email: "invalid@email.com",
          password: "123abc",
          SIN: "654321",
          addrStreet: "123 Tester Street",
          addrCity: "12345",
          addrProv: "ON",
          addrPostal: "B1B1B1",
          status: "Active",
          department: 2,
          hireDate: "2024-03-22"
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrCity failed" });
    })
    test('post attempt with province validation error', async () => {
        const res = await request(app)
        .post('/employees/add')
        .send({
          givenName: "invalid",
          surname: "invalid",
          email: "invalid@email.com",
          password: "123abc",
          SIN: "654321",
          addrStreet: "123 Tester Street",
          addrCity: "Toronto",
          addrProv: "invalid",
          addrPostal: "B1B1B1",
          status: "Active",
          department: 2,
          hireDate: "2024-03-22"
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation isIn on addrProv failed" });
    })
    test('update test should update employee', async () => {
        const resGet = await request(app).get('/employees');
        const successResponse = JSON.parse(resGet.text);
        //console.log(successResponse[successResponse.length-1])
        
        const updatedEmployee = {
            employeeID: successResponse[successResponse.length-1].employeeID,
            givenName: "Updated",
            surname: "Fellow",
            email: "updated@email.com",
            password: "123abc",
            SIN: "654321",
            addrStreet: "123 Tester Street",
            addrCity: "Toronto",
            addrProv: "ON",
            addrPostal: "A2A2A2",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
        }
        const res = await request(app)
            .post(`/employees/update`)
            .send(updatedEmployee);
        console.log(res.body)
        expect(res.body).toEqual({msg: "User updated."});
    },10000)
    test('update attempt with validation error', async () => {
        const resGet = await request(app).get('/employees');
        const successResponse = JSON.parse(resGet.text);        
        const updatedEmployee = {
            employeeID: successResponse[successResponse.length-1].employeeID,
            givenName: "invalid",
            surname: "invalid",
            email: "invalid@email.com",
            password: "123abc",
            SIN: "654321",
            addrStreet: "123 Tester Street",
            addrCity: "Toronto",
            addrProv: "ON",
            addrPostal: "invalid",
            status: "Active",
            department: 2,
            hireDate: "2024-03-22"
        }
        const res = await request(app)
            .post(`/employees/update`)
            .send(updatedEmployee);
        console.log(res.body)
        expect(res.body).toEqual({msg: "Failed to update the record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrPostal failed"});
    })
    test('delete test should delete employee given id', async () => {
        const resGet = await request(app).get('/employees');
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .delete(`/employees/delete/${successResponse[successResponse.length-1].employeeID}`)
            .expect(200);
    },10000)
});
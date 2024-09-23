const request = require('supertest');

const app = require('../main');

describe('/ health check', () => {
    test('should return HTTP 200 response', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    });
    test('test invalid route', async () => {
        const res = await request(app).get('/invalidroute');
        expect(res.statusCode).toBe(404);
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

describe('Shift Scheduling Tests', () => {
    test('read test should return shift data', async () => {
        const res = await request(app).get('/shift');
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftDate).toBe("2024-01-02");
        expect(res.body[0].startTime).toBe("09:00:00");
        expect(res.body[0].endTime).toBe("13:15:00");
        expect(res.body[0].isHoliday).toBe(0);
        expect(res.body[0].shiftID).toBe(2);
        const successResponse = JSON.parse(res.text);
        console.log(successResponse.length);
    });

    test('create test should post new shift', async () => {
        const res = await request(app)
          .post('/shift/add')
          .send({
            shiftDate: "2025-01-25",
            startTime: "10:00:00",
            endTime: "17:30:00",
            isHoliday: 0,
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "New shift added." });
    },10000);

    test('shift validation error: invalid start time', async () => {
        const res = await request(app)
          .post('/shift/add')
          .send({
            shiftDate: "2025-01-25",
            startTime: "25:00:00",
            endTime: "17:30:00",
            isHoliday: 0,
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "Failed to create shift due to: Start time not within 24 hours of a day or minutes not in 15 minutes interval." });
    },10000);

    test('shift validation error: invalid end time', async () => {
        const res = await request(app)
          .post('/shift/add')
          .send({
            shiftDate: "2025-01-25",
            startTime: "10:00:00",
            endTime: "17:35:00",
            isHoliday: 0,
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "Failed to create shift due to: End time not within 24 hours of a day or minutes not in 15 minutes interval." });
    },10000);

    test('shift validation error: start time after end time', async () => {
        const res = await request(app)
          .post('/shift/add')
          .send({
            shiftDate: "2025-01-25",
            startTime: "20:00:00",
            endTime: "17:30:00",
            isHoliday: 0,
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "Failed to create shift due to: End time must be after start time." });
    },10000);

    test('get test should return a record with given id', async () => {
        const resGet = await request(app).get('/shift');
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .get(`/shift/?shiftID=${successResponse[successResponse.length-1].shiftID}`);
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftDate).toBe("2025-01-25");
        expect(res.body[0].startTime).toBe("10:00:00");
        expect(res.body[0].endTime).toBe("17:30:00");
        expect(res.body[0].isHoliday).toBe(0);
    },10000);

    test('get test should return a record with given date', async () => {
        const resGet = await request(app).get('/shift');
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .get(`/shift/?shiftDate=${successResponse[successResponse.length-1].shiftDate}`);
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftID).toBe(parseInt(`${successResponse[successResponse.length-1].shiftID}`));
        expect(res.body[0].startTime).toBe("10:00:00");
        expect(res.body[0].endTime).toBe("17:30:00");
        expect(res.body[0].isHoliday).toBe(0);
    },10000);

    test('update test should update shift', async () => {
        const resGet = await request(app).get('/shift');
        const successResponse = JSON.parse(resGet.text);
        
        const updatedShift = {
            shiftID: successResponse[successResponse.length-1].shiftID,
            shiftDate: "2025-07-30",
            startTime: "10:30:00",
            endTime: "18:00:00",
            isHoliday: 0
        }
        const res = await request(app)
            .post(`/shift/update`)
            .send(updatedShift);
        expect(res.body).toEqual({msg: "Shift updated."});
    },10000);

    test('delete test should delete a shift with given id', async () => {
        const resGet = await request(app).get('/shift');
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .delete(`/shift/delete/${successResponse[successResponse.length-1].shiftID}`)
            .expect(200);
    },10000);
});
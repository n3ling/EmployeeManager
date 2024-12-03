const request = require('supertest');

const app = require('../main');

async function SetCookie() {
    const userLogin = {
        email: "manager@test.com",
        password: "a1"
    }
    const resLogin = await request(app)
        .post('/login')
        .send(userLogin)

    const cookie = resLogin.headers['set-cookie']
    return cookie
}

// health check suite
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

// login module suite
describe('Login Module Tests', () => {
    test('test successful login', async () => {
        const user = {
            email: "manager@test.com",
            password: "a1"
        }
        const res = await request(app)
        .post('/login')
        .send(user)
        
        const successResponse = JSON.parse(res.text)
        
        expect(res.statusCode).toBe(200)
        expect(successResponse).toEqual({ msg: "Hello test manager." })
    },10000)
    test('test unsuccessful login', async () => {
        const user = {
            email: "invalid@test.com",
            password: "a1"
        }
        const res = await request(app)
        .post('/login')
        .send(user)
        
        const successResponse = JSON.parse(res.text)
        
        expect(res.statusCode).toBe(401)
        expect(successResponse).toEqual({ msg: "No user with matching credentials" })
    },10000)
    test('test successful logout', async () => {
        const res = await request(app).get('/logout')
    
        const successResponse = JSON.parse(res.text)
    
        expect(res.statusCode).toBe(200)
        expect(successResponse).toEqual({ msg: "Logged out." })
    })
})

// employee module suite
describe('Employee Module Tests', () => {
    test('read test should return employee data', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
            .get('/employees')
            .set('Cookie', cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body[1].givenName).toBe("John");
        expect(res.body[1].surname).toBe("Caruso");
        expect(res.body[1].email).toBe("John.D@email.com");
        expect(res.body[1].employeeID).toBe(7);
        const successResponse = JSON.parse(res.text);
        console.log(successResponse.length);
    },10000);
    test('create test should post employee', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/employees/add')
          .set('Cookie', cookie)
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
            hireDate: "2024-03-22",
            payRate: 20
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "New user added." });
      },10000);
      test('post failed, unique constraint error', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/employees/add')
          .set('Cookie', cookie)
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
            hireDate: "2024-03-22",
            payRate: 20
          });
          const successResponse = JSON.parse(res.text);
          console.log(successResponse)
          expect(successResponse).toEqual({ msg: "Failed to create Employee record for Fellow, Tester: SequelizeUniqueConstraintError: Validation error" });
      },10000);
    test('post attempt with postal code validation error', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
        .post('/employees/add')
        .set('Cookie', cookie)
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
          hireDate: "2024-03-22",
          payRate: 20
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrPostal failed" });
    })
    test('post attempt with city validation error', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
        .post('/employees/add')
        .set('Cookie', cookie)
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
          hireDate: "2024-03-22",
          payRate: 20
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrCity failed" });
    })
    test('post attempt with province validation error', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
        .post('/employees/add')
        .set('Cookie',cookie)
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
          hireDate: "2024-03-22",
          payRate: 20
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeValidationError: Validation error: Validation isIn on addrProv failed" });
    })
    test('post attempt with payRate validation error', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
            .post('/employees/add')
            .set('Cookie',cookie)
            .send({
          givenName: "invalid",
          surname: "invalid",
          email: "invalid@email.com",
          password: "123abc",
          SIN: "654321",
          addrStreet: "123 Tester Street",
          addrCity: "Toronto",
          addrProv: "ON",
          addrPostal: "B1B1B1",
          status: "Active",
          department: 2,
          hireDate: "2024-03-22",
          payRate: "aaa"
        });
        const successResponse = JSON.parse(res.text);
        console.log(successResponse)
        expect(successResponse).toEqual({ msg: "Failed to create Employee record for invalid, invalid: SequelizeDatabaseError: Data truncated for column 'payRate' at row 1" });
    })
    test('update test should update employee', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/employees')
            .set('Cookie',cookie);
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
            hireDate: "2024-03-22",
            payRate: 20
        }
        const res = await request(app)
            .post(`/employees/update`)
            .set('Cookie',cookie)
            .send(updatedEmployee);
        console.log(res.body)
        expect(res.body).toEqual({msg: "User updated."});
    },10000)
    test('update attempt with validation error', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/employees')
            .set('Cookie',cookie);
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
            hireDate: "2024-03-22",
            payRate: 20
        }
        const res = await request(app)
            .post(`/employees/update`)
            .set('Cookie',cookie)
            .send(updatedEmployee);
        console.log(res.body)
        expect(res.body).toEqual({msg: "Failed to update the record for invalid, invalid: SequelizeValidationError: Validation error: Validation is on addrPostal failed"});
    })
    test('delete test should delete employee given id', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/employees')
            .set('Cookie',cookie);
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .delete(`/employees/delete/${successResponse[successResponse.length-1].employeeID}`)
            .set('Cookie',cookie)
            .expect(200);
    },10000)
});

// shift module suite
describe('Shift Scheduling Tests', () => {
    test('read test should return shift data', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
            .get('/shift')
            .set('Cookie',cookie);
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftDate).toBe("2026-01-02");
        expect(res.body[0].startTime).toBe("15:00:00");
        expect(res.body[0].endTime).toBe("17:30:00");
        expect(res.body[0].isHoliday).toBe(0);
        expect(res.body[0].shiftID).toBe(3);
        const successResponse = JSON.parse(res.text);
        console.log(successResponse.length);
    });

    test('create test should post new shift', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/shift/add')
          .set('Cookie',cookie)
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
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/shift/add')
          .set('Cookie',cookie)
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
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/shift/add')
          .set('Cookie',cookie)
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
        const cookie = await SetCookie()
        const res = await request(app)
          .post('/shift/add')
          .set('Cookie',cookie)
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
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/shift')
            .set('Cookie',cookie);
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .get(`/shift/?shiftID=${successResponse[successResponse.length-1].shiftID}`)
            .set('Cookie',cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftDate).toBe("2025-01-25");
        expect(res.body[0].startTime).toBe("10:00:00");
        expect(res.body[0].endTime).toBe("17:30:00");
        expect(res.body[0].isHoliday).toBe(0);
    },10000);

    test('get test should return a record with given date', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/shift')
            .set('Cookie',cookie)
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .get(`/shift/?shiftDate=${successResponse[successResponse.length-1].shiftDate}`)
            .set('Cookie',cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body[0].shiftID).toBe(parseInt(`${successResponse[successResponse.length-1].shiftID}`));
        expect(res.body[0].startTime).toBe("10:00:00");
        expect(res.body[0].endTime).toBe("17:30:00");
        expect(res.body[0].isHoliday).toBe(0);
    },10000);

    test('get test for non-existing value should return empty', async () => {
        const cookie = await SetCookie()
        const res = await request(app)
            .get('/shift/?shiftID=0')
            .set('Cookie',cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('update test should update shift', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/shift')
            .set('Cookie',cookie)
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
            .set('Cookie',cookie)
            .send(updatedShift);
        expect(res.body).toEqual({msg: "Shift updated."});
    },10000);

    test('update with incomplete record', async () => {
        const cookie = await SetCookie()
        const invalidShift = {
            shiftID: 0,
        }
        const res = await request(app)
            .post('/shift/update')
            .set('Cookie',cookie)
            .send(invalidShift);
        expect(res.statusCode).toBe(400);
    });

    test('update non-existing record', async () => {
        const cookie = await SetCookie()
        const nonExistingShift = {
            shiftID: 0,
            shiftDate: "2024-10-10",
            startTime: "10:00:00",
            endTime: "13:00:00"
        }
        const res = await request(app)
            .post('/shift/update')
            .set('Cookie',cookie)
            .send(nonExistingShift);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({msg: "Failed to update shift due to: Shift with ID #0 does not exist."})
    })

    test('delete test should delete a shift with given id', async () => {
        const cookie = await SetCookie()
        const resGet = await request(app)
            .get('/shift')
            .set('Cookie',cookie)
        const successResponse = JSON.parse(resGet.text);
        const res = await request(app)
            .delete(`/shift/delete/${successResponse[successResponse.length-1].shiftID}`)
            .set('Cookie',cookie)
            .expect(200);
    },10000);
});

// attendance module suite
describe('Attendance Manager Module Tests', () => {

    test('Create attendance record', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 8,
            empID: 1,
            checkedIn: false,
            isPaid: false
        }
        const res = await request(app)
        .post("/attendance/add")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "New attendance added."});
    });

    test('Attempt to create record with invalid empID', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 8,
            empID: 0,
            checkedIn: false,
            isPaid: false
        }
        const res = await request(app)
        .post("/attendance/add")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            "msg": "addOneAttendance catch: Employee not found."
          });
    });

    test('Attempt to create record with invalid shiftID', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 0,
            empID: 1,
            checkedIn: false,
            isPaid: false
        }
        const res = await request(app)
        .post("/attendance/add")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            "msg": "addOneAttendance catch: Shift not found."
          });
    });

    test('Attempt to create record with overlapping shift', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 8,
            empID: 1,
            checkedIn: false,
            isPaid: false
        }
        const res = await request(app)
        .post("/attendance/add")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            "msg": "Failed to create attendance: overlapping shift times."
          });
    });

    test('Attempt to update checkedIn status with improper format', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 8,
            empID: 1,
            checkedIn: 9,
            isPaid: false
        }
        const res = await request(app)
        .post("/attendance/checkIn")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            "msg": "Checked In status must be boolean."
          });
    });

    test('Attempt to update isPaid status with improper format', async() => {
        const cookie = await SetCookie()
        const attRecord = {
            shiftID: 8,
            empID: 1,
            checkedIn: false,
            isPaid: 9
        }
        const res = await request(app)
        .post("/attendance/pay")
        .set('Cookie',cookie)
        .send(attRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            "msg": "Payment status must be boolean."
          });
    });

    test('Read attendance records', async() => {
        const cookie = await SetCookie()
        const res = await request(app)
        .get("/attendance")
        .set('Cookie',cookie);
        const successResponse = JSON.parse(res.text);
        expect(res.statusCode).toBe(200);
        expect(res.body[successResponse.length-1].empID).toBe(1);
        expect(res.body[successResponse.length-1].checkedIn).toBe(0);
    });

    test('Get attendance by empID', async() => {
        const cookie = await SetCookie()
        const res = await request(app)
        .get("/attendance?empID=1")
        .set('Cookie',cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body[0].empID).toEqual(1);
    });

    test('Get attempt for invalid parameter', async() => {
        const cookie = await SetCookie()
        const res = await request(app)
        .get("/attendance?attendanceID=0")
        .set('Cookie',cookie)
        expect(res.body).toEqual([]);
    });

    test('Update attendance record', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 3,
            empID: 1,
            checkedIn:0
        }

        const res = await request(app)
        .post("/attendance/update")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "Attendance updated."});
    });

    test('/attendance/checkIn route', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 3,
            empID: 1,
            checkedIn: true,
            isPaid: false
        }

        const res = await request(app)
        .post("/attendance/checkin")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "Checked in status updated."});
    });

    test('/attendance/pay route', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 3,
            empID: 1,
            checkedIn: true,
            isPaid: true
        }

        const res = await request(app)
        .post("/attendance/pay")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "Paid status updated."});
    });

    test('Update attempt with overlapping shift', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 3,
            empID: 1,
            checkedIn: false,
            isPaid: false
        }

        const res = await request(app)
        .post("/attendance/update")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            msg: "Failed to update attendance: overlapping shift times."
          });
    });

    test('Update attempt with nonexisting shift', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 0,
            empID: 1,
            checkedIn: false,
            isPaid: false
        }

        const res = await request(app)
        .post("/attendance/update")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            msg: "updateOneAttendance catch: Shift not found."
          });
    });

    test('Update attempt with invalid empID', async() => {
        const cookie = await SetCookie()
        const resTestRecord = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successTestRecord = JSON.parse(resTestRecord.text);

        const updatedRecord = {
            attendanceID: successTestRecord[successTestRecord.length-1].attendanceID,
            shiftID: 3,
            empID: 0,
            checkedIn: false,
            isPaid: false
        }

        const res = await request(app)
        .post("/attendance/update")
        .set('Cookie',cookie)
        .send(updatedRecord);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
            msg: "updateOneAttendance catch: Employee not found."
          });
    });

    test('Delete attendance records', async() => {
        const cookie = await SetCookie()
        const resAtt = await request(app)
            .get("/attendance")
            .set('Cookie',cookie)
        const successAttRes = JSON.parse(resAtt.text);

        const res = await request(app)
        .delete(`/attendance/delete/${successAttRes[successAttRes.length-1].attendanceID}`)
        .set('Cookie',cookie)
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({msg: "Attendance deleted."});
    });

    test('Attempting to delete a non-existing attendance record', async() => {
        const cookie = await SetCookie()
        const res = await request(app)
            .delete("/attendance/delete/0")
            .set('Cookie',cookie)
        expect(res.body).toEqual({msg: "Attendance #0 not found."});
    });
});

describe('Payment Calculator Module Tests', () => {
    test('Test successful /earnings/all route', async() => {
        const cookie = await SetCookie()
        const dateRange = {
            startDate: "2024-01-08",
            endDate: "2024-12-31"
        }

        const res = await request(app)
        .post("/earnings/all")
        .set('Cookie',cookie)
        .send(dateRange);
        expect(res.statusCode).toBe(200);
    });

    test('Test successful /earnings/single route', async() => {
        const cookie = await SetCookie()
        const empSearch = {
            empID: 1,
            startDate: "2024-01-08",
            endDate: "2024-12-31"
        }

        const res = await request(app)
        .post("/earnings/single")
        .set('Cookie',cookie)
        .send(empSearch);
        expect(res.statusCode).toBe(200);
    });

    test('Attempt to find employee earnings for non-existing employee', async() => {
        const cookie = await SetCookie()
        const empSearch = {
            empID: 2,
            startDate: "2024-01-08",
            endDate: "2024-12-31"
        }

        const res = await request(app)
        .post("/earnings/single")
        .set('Cookie',cookie)
        .send(empSearch);
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({msg: "Employee not found."})
    });

    test('Attendances list returns empty on query no match for /earnings/all', async() => {
        const cookie = await SetCookie()
        const dateRange = {
            startDate: "2020-01-08",
            endDate: "2020-12-31"
        }

        const res = await request(app)
        .post("/earnings/all")
        .set('Cookie',cookie)
        .send(dateRange);

        const jsonData = JSON.parse(res.text);
        expect(jsonData.attendancesList).toEqual([]);
    });

    test('Attendances list returns empty on query no match for /earnings/single', async() => {
        const cookie = await SetCookie()
        const empSearch = {
            empID: 1,
            startDate: "2020-01-08",
            endDate: "2020-12-31"
        }

        const res = await request(app)
        .post("/earnings/all")
        .set('Cookie',cookie)
        .send(empSearch);

        const jsonData = JSON.parse(res.text);
        expect(jsonData.attendancesList).toEqual([]);
    });
});
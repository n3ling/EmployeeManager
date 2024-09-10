//This file defines the schema and it's CRUD operations for the Shift Scheduling module

require('dotenv').config();

const dataProcessor = require("../data_processor.js");
const Sequelize = require('sequelize');

//-------DATA MODELS-------

// Shift data model
var Shift = dataProcessor.sequelize.define('Shift', {
    shiftID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shiftDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    endTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    isHoliday: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
});

// Enum object for valid fields in all lowercase
const ShiftFields = [
    'shiftDate', 'startTime',
    'endTime', 'isHoliday'
  ]
exports.ShiftFields = ShiftFields;


//-------HELPER FUNCTIONS-------
// Checks if the shift time is a valid time
function isValidShiftTime(shiftTime){

    shiftHours = Number(shiftTime.split(":")[0]);
    shiftMinutes = Number(shiftTime.split(":")[1]);

    if (shiftHours < 0 || shiftHours > 23)
        return false
    if (shiftMinutes != 0 && shiftMinutes != 15 && shiftMinutes != 30 && shiftMinutes != 45)
        return false
    
    return true;
};

// Checks if the shift end time is after the shift start time
// Returns [T/F (bool), errMsg (str)]
function isEndAfterStart(shiftData){
    if (!isValidShiftTime(shiftData.startTime))
        return [false, "Start time not within 24 hours of a day or minutes not in 15 minutes interval."]
    if (!isValidShiftTime(shiftData.endTime))
        return [false, "End time not within 24 hours of a day or minutes not in 15 minutes interval."]
    if (shiftData.endTime <= shiftData.startTime)
        return [false, "End time must be after start time."]
    return [true, "Shift times are valid."]
};


//-------CRUD OPERATIONS-------
// Add a single shift
exports.addOneShift = function addOneShift(shiftData) {
    return new Promise ((resolve, reject) => {

        // confirm that the shift times' minutes are only in :00, :15, :30, :45
        isShiftTimeValid = isEndAfterStart(shiftData);
        console.log(isShiftTimeValid);
        if (isShiftTimeValid[0]){
            
            // Casting to fields to appropriate type
            if (typeof(shiftData.shiftDate) === 'string'){
                shiftData.shiftDate = Date.parse(shiftData.shiftDate);
            }   

            Shift.create(shiftData)
            .then((shift) => {
                console.log(`Record for shift on ${shift.shiftDate} successfully created.`);
                resolve();
            })
            .catch((err) => {
                console.log(`Failed to create shift on ${shiftData.shiftDate}: ${err}`);
                reject(`Failed to create shift due to: ${err}`);
            });
        }
        else {
            reject(`Failed to create shift due to: ${isShiftTimeValid[1]}`);
        }
        // bcrypt.hash(empData.password, 10).then(hash => {
        //     empData.password = hash;

        //     // Casting to fields to appropriate type
        //     if (typeof(empData.empManagerID) === 'string'){
        //         empData.empManagerID = parseInt(empData.empManagerID);
        //     }
        //     if (typeof(empData.hireDate) === 'string'){
        //         empData.hireDate = Date.parse(empData.hireDate);
        //     }   

        //     Employee.create(empData)
        //     .then((emp) => {
        //         console.log(`Record for ${emp.surname}, ${emp.givenName} successfully created.`);
        //         resolve();
        //     })
        //     .catch((err) => {
        //         console.log(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);
        //         reject(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);
        //     });
        // })
        // .catch(err => {
        //     console.log(err);
        //     reject(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);
        // });
    });
};


// TODO: all below
// Retrieve all employees
exports.getAllEmployees = function getAllEmployees() {
    return new Promise ((resolve, reject) => {
        Employee.findAll({raw: true, nest: true})
        .then((allEmp) => {
            resolve(allEmp);
        })
        .catch((err) => {
            reject('No results returned: ' + err);
        });
    });
};

// Retrieve a list of employees with the matching status
exports.getEmployeesByField = function getEmployeesByField(field, val) {
    if (typeof(field) != "string") {
        field = String(field);
    }    
    field = field.toLowerCase();

    if (typeof(val) === "string") {
        val = val.toLowerCase();
    }
    
    return new Promise ((resolve, reject) => {
        Employee.findAll({
            where: {[field]: val},
            raw: true,
            nest: true
        })
        .then((matchedEmployees) => {
            resolve(matchedEmployees);
        })
        .catch((error) => {
            reject(`No employees with ${field}: ${val}: ` + error);
        });
    });

};

// Update the employee with the matching employee ID
exports.updateOneEmployee = function updateOneEmployee(empData) {
    return new Promise ((resolve, reject) => {
        // Casting to fields to appropriate type
        if (typeof(empData.empManagerID) === 'string'){
            empData.empManagerID = parseInt(empData.empManagerID);
        }
        if (typeof(empData.hireDate) === 'string'){
            empData.hireDate = Date.parse(empData.hireDate);
        }

        // TODO: Validation for status

        Employee.update({
            employeeID: empData.employeeID,
            givenName: empData.givenName,
            surname: empData.surname,
            email: empData.email,
            password: empData.password,
            SIN: empData.SIN,
            addrStreet: empData.addrStreet,
            addrCity: empData.addrCity,
            addrProv: empData.addrProv,
            addrPostal: empData.addrPostal,
            isManager: empData.isManager,
            empManagerID: empData.empManagerID,
            status: empData.status,
            department: empData.department,
            hireDate: empData.hireDate,
        }, {
            where: {employeeID: empData.employeeID}
        })
        .then(() => {
            console.log(`Record for ${empData.surname}, ${empData.givenName} updated.`);
            resolve();
        })
        .catch((err) => {
            console.log(`Failed to update the record for ${empData.surname}, ${empData.givenName}: ${err}`);
            reject(`Failed to update the record for ${empData.surname}, ${empData.givenName}: ${err}`);
        });
    })
}

// Delete the employee with the matching employee ID
exports.deleteEmployeeByID = function deleteEmployeeByID(empID) {
    return new Promise ((resolve, reject) => {
        Employee.destroy({
            where: {employeeID: empID}
        })
        .then(() => {
            console.log(`Employee #${empID} deleted.`);
            resolve();
        })
        .catch((err) => {
            console.log(`Failed to delete employee #${empID}: ${err}`);
            reject(`Failed to delete employee #${empID}: ${err}`);
        });
    });
};



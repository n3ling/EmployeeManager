//This file defines the schema and it's CRUD operations for the Attendance Management module

require('dotenv').config();

const dataProcessor = require("../data_processor.js");
const Sequelize = require('sequelize');
const employeeProfile = require("./modules/employeeProfile.js");
const shiftScheduler = require("./modules/shiftScheduling.js");

//-------DATA MODELS-------

// Attendance data model
var Attendance = dataProcessor.sequelize.define('Attendance', {
    attendanceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shiftID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    employeeID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    checkedIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
});

// Enum object for valid fields in all lowercase
const AttendanceFields = [
    'shiftID', 'employeeID',
    'checkedIn'
  ]
exports.AttendanceFields = AttendanceFields;


//-------HELPER FUNCTIONS-------
// Checks if the employee exists
function employeeExist(empID){
    let empFoundCount = employeeProfile.getEmployeesByField("empID", empID);

    if (empFoundCount == 0)
        return false
    return true;
};

// Checks if the shift exists
function shiftExist(shiftID){
    let shiftsFoundCount = shiftScheduler.getShiftsByField("shiftID", shiftID);

    if (shiftsFoundCount == 0)
        return false
    return true
};

// Checks if the attendance is valid
// Returns [T/F (bool), numErrors(int), errMsg (str)]
function validAttendance(attendanceData){
    let numErrors = 0; // number of errors preventing attendance from being created
    let rejReason = "Attendance cannot be created due to the following:";
    let matchedAttendances = []; // list of existing attendances for the employee
    let duplicateShift = false;
    let isValidAttendance = false;

    // confirm that the employee and shift exist
    if (!employeeExist(attendanceData.empID)){
        numErrors += 1;
        rejReason += "/nEmployee not found."
    }
    if (!shiftExist(attendanceData.shiftID)){
        numErrors += 1;
        rejReason += "/nShift not found."
    }

    // Checks if employee is already signed up for that shift
    matchedAttendances = exports.getAttendancesByField("empID", attendanceData.empID);
    duplicateShift = matchedAttendances.find(
        existingAttendance => existingAttendance.shiftID == attendanceData.shiftID
    );
    if (duplicateShift){
        numErrors += 1;
        rejReason += "/nEmployee is already registered for this shift."
    }

    if (!numErrors)
        isValidAttendance = true;

    return [isValidAttendance, numErrors, rejReason];
}

//-------CRUD OPERATIONS-------
// Add a single attendance
exports.addOneAttendance = function addOneAttendance(attendanceData) {
    // Casting to fields to appropriate type
    if (typeof(attendanceData.attendanceID) === 'string'){
        attendanceData.attendanceID = parseInt(attendanceData.attendanceID);
    }
    if (typeof(attendanceData.empID) === 'string'){
        attendanceData.empID = parseInt(attendanceData.empID);
    }
    if (typeof(attendanceData.shiftID) === 'string'){
        attendanceData.shiftID = parseInt(attendanceData.shiftID);
    }

    return new Promise ((resolve, reject) => {
        let numErrors = 0; // number of errors preventing attendance from being created
        let rejReason = "";
        let attendanceValidation = []; // [T/F (bool), numErrors(int), errMsg (str)]
        let isValidAttendance = false;        

        // Assigning results of validation to individual variables for clarity
        attendanceValidation = validAttendance(attendanceData);
        isValidAttendance = attendanceValidation[0];
        numErrors = attendanceValidation[1];
        rejReason = attendanceValidation[2];

        if (isValidAttendance){
            Attendance.create(Attendance)
            .then((attendance) => {
                console.log(`Record for attendance successfully created.`);
                resolve(attendance);
            })
            .catch((err) => {
                console.log(`Failed to create attendance: ${err}`);
                reject(`Failed to create attendance due to: ${err}`);
            });
        }
        else {
            reject(`Failed to create attendance due ${numErrors} error(s) to: ${rejReason}`);
        }
    });
};

// Retrieve all attendances
exports.getAllAttendances = function getAllAttendances() {
    return new Promise ((resolve, reject) => {
        Attendance.findAll({raw: true, nest: true})
        .then((allAttendances) => {
            resolve(allAttendances);
        })
        .catch((err) => {
            reject('No results returned: ' + err);
        });
    });
};

// Retrieve a list of attendances with the matching status
exports.getAttendancesByField = function getAttendancesByField(field, val) {
    if (typeof(field) != "string") {
        field = String(field);
    }    
    field = field.toLowerCase();

    if (typeof(val) === "string") {
        val = val.toLowerCase();
    }
    
    return new Promise ((resolve, reject) => {
        Attendance.findAll({
            where: {[field]: val},
            raw: true,
            nest: true
        })
        .then((matchedAttendances) => {
            resolve(matchedAttendances);
        })
        .catch((error) => {
            reject(`No attendances with ${field}: ${val}: ` + error);
        });
    });

};

// Update the attendance with the matching attendance ID
exports.updateOneAttendance = function updateOneAttendance(attendanceData) {
    // Casting to fields to appropriate type
    if (typeof(attendanceData.attendanceID) === 'string'){
        attendanceData.attendanceID = parseInt(attendanceData.attendanceID);
    }
    if (typeof(attendanceData.empID) === 'string'){
        attendanceData.empID = parseInt(attendanceData.empID);
    }
    if (typeof(attendanceData.shiftID) === 'string'){
        attendanceData.shiftID = parseInt(attendanceData.shiftID);
    }

    return new Promise ((resolve, reject) => {
        let numErrors = 0; // number of errors preventing attendance from being created
        let rejReason = "";
        let attendanceValidation = []; // [T/F (bool), numErrors(int), errMsg (str)]
        let isValidAttendance = false;        

        // Assigning results of validation to individual variables for clarity
        attendanceValidation = validAttendance(attendanceData);
        isValidAttendance = attendanceValidation[0];
        numErrors = attendanceValidation[1];
        rejReason = attendanceValidation[2];

        if (isValidAttendance){
            Attendance.create(Attendance)
            .then((attendance) => {
                console.log(`Record for attendance successfully created.`);
                resolve(attendance);
            })
            .catch((err) => {
                console.log(`Failed to create attendance: ${err}`);
                reject(`Failed to create attendance due to: ${err}`);
            });
        }
        else {
            reject(`Failed to create attendance due ${numErrors} error(s) to: ${rejReason}`);
        }
        
        if (isValidAttendance){
            Attendance.update({
                empID: attendanceData.empID,
                shiftID: attendanceData.shiftID,
                checkedIn: attendanceData.checkedIn,
            }, {
                where: {attendanceID: attendanceData.attendanceID}
            })
            .then((attendance) => {
                // Found matching attendance
                if (attendance > 0){
                    console.log(
                        `Record for attendance ID #${attendanceData.attendanceID} successfully updated.`
                    );
                    resolve(attendance);
                }
                // No attendance with matching ID
                else {
                    console.log(rejReason);
                    reject(
                        `Failed to update attendance due ${numErrors} error(s) to: ${rejReason}`
                    );
                }
                
            })
            .catch((err) => {
                console.log(`Failed to update attendance: ${err}`);
                reject(`Failed to update attendance due to: ${err}`);
            });
        }
        else {
            reject(
                `Failed to update attendance due to ${numErrors} error(s) to: ${rejReason}`
            );
        }
    })
}

// TODO:
// Delete the employee with the matching employee ID
exports.deleteShiftByID = function deleteShiftByID(recievedShiftID) {
    return new Promise ((resolve, reject) => {
        Shift.destroy({
            where: {shiftID: recievedShiftID}
        })
        .then(() => {
            console.log(`Shift #${recievedShiftID} deleted.`);
            resolve();
        })
        .catch((err) => {
            console.log(`Failed to delete shift #${recievedShiftID}: ${err}`);
            reject(`Failed to delete shift #${recievedShiftID}: ${err}`);
        });
    });
};



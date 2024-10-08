//This file defines the schema and it's CRUD operations for the Attendance Management module

require('dotenv').config();

const dataProcessor = require("../data_processor.js");
const Sequelize = require('sequelize');
const employeeProfile = require("./employeeProfile.js");
const shiftScheduler = require("./shiftScheduling.js");

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
    empID: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    checkedIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
});

// Table associations
Attendance.belongsTo(employeeProfile.EmpModel, {foreignKey: 'empID'});
Attendance.belongsTo(shiftScheduler.ShiftModel, {foreignKey: 'shiftID'});

// Enum object for valid fields in all lowercase
const AttendanceFields = [
    'shiftID', 'empID',
    'checkedIn'
  ]
exports.AttendanceFields = AttendanceFields;


//-------HELPER FUNCTIONS-------
// Gets all the shift information for attendances from a given employee
function getAttendancesByEmpID(attendanceData, selectedShift){
    return new Promise ((resolve, reject) => {
        Attendance.findAll({
            where: {
                ["empID"]: attendanceData.empID // only get attendances from the matching employee
            },
            include: [{ // joining shift table
                model: shiftScheduler.ShiftModel,
                attributes: [
                    'shiftID', 'shiftDate', 'startTime', 'endTime', 'isHoliday'
                ]
            }],
            raw: true,
            nest: true
        })
        .then((matchedAttendances) => {
            // [[array of attendances from matching employee], [array of shifts matching shiftID]]
            resolve([matchedAttendances, selectedShift]);
        })
        .catch((err) => {
            reject('getAttendancesByEmpID catch: ' + err);
        });
    });
}

// Checks if the attendance is valid
// Returns [T/F (bool), numErrors(int), errMsg (str)]
function hasOverlapShift(attendanceData){
    return new Promise ((resolve, reject) => {
        shiftScheduler.getShiftsByField("shiftID", attendanceData.shiftID)
        .then((selectedShift) => {
            return getAttendancesByEmpID(attendanceData, selectedShift)
        })
        .then((matchedAndSelectedAttendance) => {
            // This is what matchedAndSelectedAttendance contains:
            // matchedAndSelectedAttendance = [
            //     [array of attendances from matching employee], 
            //     [array of shifts matching shiftID]
            // ]
            
            let matchedAttendances = matchedAndSelectedAttendance[0]
            let selectedShift = matchedAndSelectedAttendance[1][0];

            let attendanceSameDay = matchedAttendances.filter(
                attendance => attendance.Shift.shiftDate == selectedShift.shiftDate);

            let hasOverlap = attendanceSameDay.some(
                attendance => 
                    attendance.Shift.startTime < selectedShift.endTime 
                    && attendance.Shift.endTime > selectedShift.startTime
            );

            resolve(hasOverlap);
        })
        .catch((err) => {
            console.log('hasOverlapShift catch: employee or shift not found, ' + err);
            reject('hasOverlapShift catch: employee or shift not found.');
        });
    });
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
        hasOverlapShift(attendanceData)
        .then((hasOverlap) => {
            if (!hasOverlap){
                Attendance.create(attendanceData)
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
                console.log(`Failed to create attendance: overlapping shift times.`);
                reject(`Failed to create attendance: overlapping shift times.`);
            }            
        })
        .catch((err) => {
            reject('addOneAttendance catch: ' + err);
        });
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

        hasOverlapShift(attendanceData)
        .then((hasOverlap) => {
            if (!hasOverlap){
                Attendance.update({
                    empID: attendanceData.empID,
                    shiftID: attendanceData.shiftID,
                    checkedIn: attendanceData.checkedIn,
                }, {
                    where: {attendanceID: attendanceData.attendanceID}
                })
                .then((attendance) => {
                console.log(`Record for attendance successfully updated.`);
                resolve(attendance);
                })
                .catch((err) => {
                    console.log(`Failed to update attendance: ${err}`);
                    reject(`Failed to update attendance due to: ${err}`);
                });
            }
            else {
                console.log(`Failed to update attendance: overlapping shift times.`);
                reject(`Failed to update attendance: overlapping shift times.`);
            }            
        })
        .catch((err) => {
            reject('updateOneAttendance catch: ' + err);
        });
    })
}

// Delete the attendance with the matching attendance ID
exports.deleteAttendanceByID = function deleteAttendanceByID(receivedAttendanceID) {
    return new Promise ((resolve, reject) => {
        Attendance.destroy({
            where: {attendanceID: receivedAttendanceID}
        })
        .then((deletedCount) => {
            if (deletedCount > 0){
                console.log(`Attendance #${receivedAttendanceID} deleted.`);
                resolve(`Attendance #${receivedAttendanceID} deleted.`);
            }
            else{
                console.log(`Attendance #${receivedAttendanceID} not found.`);
                reject(`Attendance #${receivedAttendanceID} not found.`);
            }
        })
        .catch((err) => {
            console.log(`Failed to delete attendance #${receivedAttendanceID}: ${err}`);
            reject(`Failed to delete attendance #${receivedAttendanceID}: ${err}`);
        });
    });
};



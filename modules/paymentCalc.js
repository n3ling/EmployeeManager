//This file defines the operations for the Payment Calculator (Earnings) module
//This does not have a DB table

require('dotenv').config();

const dataProcessor = require("../data_processor.js");
const Sequelize = require('sequelize');
const employeeProfile = require("./employeeProfile.js");
const shiftScheduler = require("./shiftScheduling.js");
const attendance = require("./attendance.js");

//-------DATA MODELS (No DB tables)-------
// Enum object for valid fields in all lowercase
const earningsFields = [    
    "regularHoursOutstanding",
    "holidayHoursOutstanding",
    "regularHoursPaid",
    "holidayHoursPaid",
    "totalHoursOutstanding", 
    "totalHoursPaid",
    "attendancesList"
  ]
exports.earningsFields = earningsFields;


//-------HELPER FUNCTIONS-------
// Gets all the shift information for attendances from a given employee


//-------OPERATIONS-------

// // Retrieve all attendances
// exports.getAllAttendances = function getAllAttendances() {
//     return new Promise ((resolve, reject) => {
//         Attendance.findAll({raw: true, nest: true})
//         .then((allAttendances) => {
//             resolve(allAttendances);
//         })
//         .catch((err) => {
//             reject('No results returned: ' + err);
//         });
//     });
// };

// Retrieve a list of attendances with the matching status
exports.getPaymentDetailsForOneEmp = function getPaymentDetailsForOneEmp(searchFilter) {
    // Casting to fields to appropriate type
    if (typeof(searchFilter.empID) === 'string'){
        searchFilter.empID = parseInt(searchFilter.empID);
    }
    if (typeof(searchFilter.startDate) != 'string'){
        searchFilter.startDate = String(searchFilter.startDate);
    }
    if (typeof(searchFilter.endDate) != 'string'){
        searchFilter.endDate = String(searchFilter.endDate);
    }

    return new Promise ((resolve, reject) => {
        employeeProfile.getEmployeesByField("employeeID", searchFilter.empID)
        .then((employeesFound) => {
            if (employeesFound.length > 0){
                // Get only attendances from specified employee
                attendance.getAttendancesByEID(searchFilter, null)
                .then((results) => {
                    let matchedAttendances = results[0];
                    // Narrow down to only attendances within specified date range
                    let filteredAttendances = matchedAttendances.filter(
                        attendance => 
                            attendance.Shift.shiftDate >= searchFilter.startDate
                            && attendance.Shift.shiftDate <= searchFilter.endDate
                        );
                    
                    // Different categories of working hours
                    let totalHoursOutstanding = 0;
                    let totalHoursPaid = 0;
                    let regularHoursOutstanding = 0;
                    let regularHoursPaid = 0;
                    let holidayHoursOutstanding = 0;
                    let holidayHoursPaid = 0;

                    // Tally up the hours worked into each category
                    filteredAttendances.forEach(attendance => {
                        let startHour = attendance.Shift.startTime.split(":")[0];
                        let startMinutes = attendance.Shift.startTime.split(":")[1];
                        let endHour = attendance.Shift.endTime.split(":")[0];
                        let endMinutes = attendance.Shift.endTime.split(":")[1];
                        let shiftHoursWorked = endHour - startHour;
                        let shiftMinutesWorked = endMinutes - startMinutes;
                        shiftHoursWorked += shiftMinutesWorked/60; // convert minutes to percent of hour

                        // only tally up shifts that were checked in
                        if (attendance.checkedIn){
                            console.log(`--- ${JSON.stringify(attendance)}`);
                                if (!attendance.isPaid && !attendance.Shift.isHoliday) {
                                    regularHoursOutstanding += shiftHoursWorked;
                                }
                                else if (!attendance.isPaid && attendance.Shift.isHoliday) {
                                    holidayHoursOutstanding += shiftHoursWorked;
                                }
                                else if (attendance.isPaid && !attendance.Shift.isHoliday) {
                                    regularHoursPaid += shiftHoursWorked;
                                }
                                else if (attendance.isPaid && attendance.Shift.isHoliday) {
                                    holidayHoursPaid += shiftHoursWorked;
                                }
                        }
                    });

                    totalHoursOutstanding = regularHoursOutstanding + holidayHoursOutstanding;
                    totalHoursPaid = regularHoursPaid + holidayHoursPaid;
                    
                    resolve({                        
                        "regularHoursOutstanding": regularHoursOutstanding,
                        "holidayHoursOutstanding": holidayHoursOutstanding,
                        "regularHoursPaid": regularHoursPaid,                        
                        "holidayHoursPaid": holidayHoursPaid,
                        "totalHoursOutstanding": totalHoursOutstanding, 
                        "totalHoursPaid": totalHoursPaid,
                        "attendancesList": filteredAttendances
                    });
                })
            }
            else{
                reject("Employee not found.");
            }
        })
        .catch((err) => {
            reject('getPaymentDetailsForOneEmp catch: ' + err);
        });
    })

};

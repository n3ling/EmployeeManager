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

        // confirm that the shift times' are valid
        isShiftTimeValid = isEndAfterStart(shiftData);
        console.log(isShiftTimeValid);
        if (isShiftTimeValid[0]){
            
            // Casting to fields to appropriate type
            // if (typeof(shiftData.shiftDate) === 'string'){
            //     shiftData.shiftDate = Date.parse(shiftData.shiftDate);
            // }

            Shift.create(shiftData)
            .then((shift) => {
                console.log(`Record for shift on ${shift.shiftDate} successfully created.`);
                resolve(shift);
            })
            .catch((err) => {
                console.log(`Failed to create shift on ${shiftData.shiftDate}: ${err}`);
                reject(`Failed to create shift due to: ${err}`);
            });
        }
        else {
            reject(`Failed to create shift due to: ${isShiftTimeValid[1]}`);
        }
    });
};

// Retrieve all shifts
exports.getAllShifts = function getAllShifts() {
    return new Promise ((resolve, reject) => {
        Shift.findAll({raw: true, nest: true})
        .then((allShifts) => {
            resolve(allShifts);
        })
        .catch((err) => {
            reject('No results returned: ' + err);
        });
    });
};

// Retrieve a list of shifts with the matching status
exports.getShiftsByField = function getShiftsByField(field, val) {
    if (typeof(field) != "string") {
        field = String(field);
    }    
    field = field.toLowerCase();

    if (typeof(val) === "string") {
        val = val.toLowerCase();
    }
    
    return new Promise ((resolve, reject) => {
        Shift.findAll({
            where: {[field]: val},
            raw: true,
            nest: true
        })
        .then((matchedShift) => {
            resolve(matchedShift);
        })
        .catch((error) => {
            reject(`No shifts with ${field}: ${val}: ` + error);
        });
    });

};

// Update the shift with the matching shift ID
exports.updateOneShift = function updateOneShift(shiftData) {
    return new Promise ((resolve, reject) => {
        // Casting to fields to appropriate type
        if (typeof(shiftData.shiftID) === 'string'){
            shiftData.shiftID = parseInt(shiftData.shiftID);
        }
        // if (typeof(shiftData.shiftDate) === 'string'){
        //     shiftData.shiftDate = Date.parse(shiftData.shiftDate);
        // }

        // confirm that the shift times' are valid
        isShiftTimeValid = isEndAfterStart(shiftData);
        console.log(isShiftTimeValid);
        if (isShiftTimeValid[0]){
            Shift.update({
                shiftDate: shiftData.shiftDate,
                startTime: shiftData.startTime,
                endTime: shiftData.endTime,
                isHoliday: shiftData.isHoliday,
            }, {
                where: {shiftID: shiftData.shiftID}
            })
            .then((shift) => {
                // Found matching shift
                if (shift > 0){
                    console.log(`Record for shift ID #${shiftData.shiftID} successfully updated.`);
                    resolve(shiftData);
                }
                // No shifts with matching ID
                else {
                    err = `Shift with ID #${shiftData.shiftID} does not exist.`;
                    console.log(err);
                    reject(`Failed to update shift due to: ${err}`);
                }
                
            })
            .catch((err) => {
                console.log(`Failed to create shift on ${shiftData.shiftDate}: ${err}`);
                reject(`Failed to update shift due to: ${err}`);
            });
        }
        else {
            reject(`Failed to update shift due to: ${isShiftTimeValid[1]}`);
        }
    })
}

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



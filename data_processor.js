require('dotenv').config();

const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT,
        pool: {
            max: 5,
            min: 0,
            idle: 10000,
            evict: 15000,
            acquire: 30000
          },
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // need SSL cert if true
            }
        }
      
    }
);

//display connection status of db connection
sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));

//-------DATA MODELS-------

// Employee data model
var Employee = sequelize.define('Employee', {
    employeeID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    givenName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    surname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            is: /^[a-zA-Z0-9](?=.*@[a-zA-Z]+\.).*[a-zA-Z0-9]$/i
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    SIN: Sequelize.STRING,
    addrStreet: Sequelize.STRING,
    addrCity: {
        type: Sequelize.STRING,
        validate: {
            is: /[a-zA-Z]+/i
        }
    },
    addrProv: {
        type: Sequelize.STRING,
        validate: {
            isIn: [[
                "AB",
                "BC",
                "MB", 
                "NB",
                "NL",
                "NS",
                "NT",
                "NU",
                "ON",
                "PE",
                "QC",
                "SK",
                "YT",
                "Alberta",
                "British Columbia",
                "Manitoba",
                "New Brunswick", 
                "Newfoundland and Labrador",
                "Nova Scotia",
                "Northwest Territories",
                "Nunavut",
                "Ontario",
                "Prince Edward Island",
                "Quebec",
                "Saskatchewan",
                "Yukon"
              ]]
        }
    },
    addrPostal: {
        type: Sequelize.STRING,
        validate: {
            is: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVXY](?:\s?)\d[ABCEGHJKLMNPRSTVXY]\d$/i
        }
    },
    isManager: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    empManagerID: Sequelize.INTEGER,
    status: {
        type: Sequelize.ENUM('Active', 'Inactive')
    },
    department: Sequelize.INTEGER,
    hireDate: Sequelize.DATEONLY,
});

// Enum object for valid fields in all lowercase
const EmpFields = [
    'givenname',  'surname',
    'email',      'addrcity',
    'addrprov',   'addrpostal',
    'ismanager',  'status',
    'department'
  ]
exports.EmpFields = EmpFields;


//-------INITIALIZERS-------

// Sync the table schema with the database
exports.initialize = function initialize() {
    return new Promise ((resolve, reject) => {
        sequelize.sync({alter: true}) // update table if columns, etc changes, but does not drop table
        .then(()=>{
            console.log("Sync successful.");
            resolve();
        })
        .catch((error)=>{
            reject("Unable to sync the database: " + error);
        });
    });
};

//-------EMPLOYEES-------
// Add a single employee
exports.addOneEmployee = function addOneEmployee(empData) {
    return new Promise ((resolve, reject) => {

        // Hash the password
        bcrypt.hash(empData.password, 10).then(hash => {
            empData.password = hash;
            
            // Casting to fields to appropriate type
            if (typeof(empData.empManagerID) === 'string'){
                empData.empManagerID = parseInt(empData.empManagerID);
            }
            if (typeof(empData.hireDate) === 'string'){
                empData.hireDate = Date.parse(empData.hireDate);
            }            

            Employee.create(empData)
            .then((emp) => {
                console.log(`Record for ${emp.surname}, ${emp.givenName} successfully created.`);
                resolve();
            })
            .catch((err) => {
                console.log(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);
                reject(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);
            });
        })
        .catch(err => {
            console.log(err);
            reject(`Failed to create ${Employee.name} record for ${empData.surname}, ${empData.givenName}: ${err}`);

        })
    });
};

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



//-------CLEAN UP-------

exports.disconnectDB = function disconnectDB(){
    return new Promise((res, rej) => {
        console.log('Closing DB connection.')
        sequelize.close();
    });
}

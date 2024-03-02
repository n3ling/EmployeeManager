require('dotenv').config();

const Sequelize = require('sequelize');

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
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    SIN: Sequelize.STRING,
    addrStreet: Sequelize.STRING,
    addrCity: Sequelize.STRING,
    addrProv: Sequelize.STRING,
    addrPostal: Sequelize.STRING,
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

//-------INITIALIZERS-------

//populates the employees and departments arrays from json files
exports.initialize = function initialize() {
    return new Promise ((resolve, reject) => {
        sequelize.sync()
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
exports.addOneEmployee = function addOneEmployee(empData) {
    return new Promise ((resolve, reject) => {

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
    });
};

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

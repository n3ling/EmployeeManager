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

//Employee data model
var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    givenName: Sequelize.STRING,
    surname: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    SIN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,
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
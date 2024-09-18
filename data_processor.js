//This file establishes the database connection 

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

exports.sequelize = sequelize;


//-------INITIALIZERS-------

// Sync the table schema with the database
exports.initialize = function initialize() {
    return new Promise ((resolve, reject) => {
        sequelize.sync({alter: false}) // doesn't update table columns, since there is a limit of 64 updates
        .then(()=>{
            console.log("Sync successful.");
            resolve();
        })
        .catch((error)=>{
            reject("Unable to sync the database: " + error);
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

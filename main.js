
const express = require("express");
const app = express();
const HTTP_PORT = process.env.DB_PORT || 8080;
const dataProcessor = require("./data_processor.js");
const employeeProfile = require("./modules/employeeProfile.js");
const sequelize = require("sequelize");
const path = require("path");
const cors = require("cors");

// Shows that server is up
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
};


//-------SIGNAL CATCHING FOR GRACEFUL SHUTDOWN-------
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down server.');
    dataProcessor.disconnectDB();

    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down server.');
    dataProcessor.disconnectDB();

    process.exit(0);
});


//-------MIDDLEWARE-------

// Loading static resources
app.use(express.static("public"));

// Handle form data without file upload
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Allow for cross site access
app.use(cors());
corsOption = {
    origin: ["https://employee-manager-ui.vercel.app/", "http://localhost:8080"]
}
app.use(cors(corsOption));

// For highlighting active menu
// ActiveRoute value = active route, eg, "/employees/add"
app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

// Setup client-sessions
// app.use(clientSessions({
//     cookieName: "session",
//     secret: "MXihTBe6wt19VpSrl5a9ivSV",
//     duration: 5 * 60 * 1000,
//     activeDuration: 60 * 1000
// }));

// Grants access to "session" object for all templates
app.use(function(req, res, next) {
    app.locals.session = req.session;
    next();
});

// Checks if user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
}


//-------GENERAL ROUTES-------

// Default 'route'
app.get("/", (req, res) => {
    //res.render("home");
    res.status(200).send("<h1>Server is running</h1>");
});


//-------EMPLOYEE ROUTES-------

app.post("/employees/add", (req, res) => {
    employeeProfile.addOneEmployee(req.body)
    .then(() => {
        res.status(200).json({msg: "New user added."});
    })
    .catch((err) => {
        console.log({message: err});
        res.status(400).json({msg: err});
    });
});

app.get("/employees", (req, res) => {
    // No queries, get all employees
    if (!Object.keys(req.query).length){
        employeeProfile.getAllEmployees()
        .then((allEmp) => {
            res.type('json');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(allEmp);
        })
        .catch((err) => {
            console.log({message: err});
            res.json({message: err});
        })
    }
    // Queries provided, filtering search by field and value
    else {
        let searchField = Object.keys(req.query)[0];
        let searchVal = Object.values(req.query)[0];
        employeeProfile.getEmployeesByField(searchField, searchVal)
        .then((matchedEmp) => {
            res.type('json');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(matchedEmp);
        })
        .catch((err) => {
            console.log({message: err});
            res.json({message: err});
        })
    }
})

app.post("/employees/update", (req, res) => {
    employeeProfile.updateOneEmployee(req.body)
    .then(() => {
        res.status(200).json({msg: "User updated."});
    })
    .catch((err) => {
        console.log({message: err});
        res.status(400).json({msg: err});
    });
})

app.delete("/employees/delete/:empID", (req, res) => {
    employeeProfile.deleteEmployeeByID(req.params.empID)
    .then(() => {
        res.status(200).json({msg: "User deleted."});
    })
    .catch((err) => {
        console.log({message: err});
        res.status(400).json({msg: err});
    })
});


//-------SERVER OPERATION-------

// Initialize the server
dataProcessor.initialize()
.then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((errMsg)=>{
    console.log(errMsg);
    res.status(500).send("Unable to sync with the database");
});


module.exports = app;
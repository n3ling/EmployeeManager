const express = require("express");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const dataProcessor = require("./data_processor.js");

// Shows that server is up
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
};


//-------MIDDLEWARE-------

// Loading static resources
app.use(express.static("public"));

// Handle form data without file upload
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
    res.send("<h1>Server is running</h1>");
});




//-------SERVER OPERATION-------

// Initialize the server
dataProcessor.initialize()
//.then(dataServiceAuth.initialize)
.then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((errMsg)=>{
    console.log(errMsg);
    res.status(500).send("Unable to sync with the database");
});

# Group_01

## Developers
Refer to official group repo.

## Project Description

### Employee Management Web Application
A company needs an employee management system that is accessible to its employees both onsite and remotely. The system needs to be be able to hold employee information and track employee work hours and rates. Employees need to have different access rights depending on their position. Payment will not be handled by the employee management system.

### Core Functionalities

#### Login System
The management app is a closed application meaning accounts will be managed and distributed through the company. Authentication will also be important for differing roles which have different authorization. Security will be important since personal employee information will be stored. For this reason passwords will be encrypted.  

#### Employee Profiles
Employee profiles will be made to store and manage employee details. Here information like address, position, rates, department and others will be made viewable to the specific employee and management roles. Employees will also be able to edit or change their personal information as needed. Management roles can edit information such as rates.

#### Attendance Management
This web app will also handle employee work hours. Employees can clock-in for work and clock-out on their own and the system will automatically log hours. Management roles can view and verify logged hours at anytime for any employee.

#### Payment Calculations
The tool will also automatically calculate employee pay through the logged work hours and stored salary information. Management roles can also add bonus payments or deduct payments through this app. However, this app will not actually distribute the pay.

#### Shift Scheduling
The web app has a scheduling system which tracks shifts and their time & availability. All users are able to view all shifts. Management roles can add and edit shifts while non management employees can sign up for available shifts.

## Technologies

### Front-end 
For performance and modularity React will be the main JavaScript library for building the interface. It will be used in conjunction with Bootstrap to ensure the web app is responsive and has consistent styling.

### Back-End
The app will use a NodeJS/Express framework. [Vercel](https://vercel.com/) will be considered for hosting the frontend since it has good integration with React. [Netlify](https://www.netlify.com/) will also be considered if Vercel does not work out.

### Database 
This web app will take advantage of relational databases since a lot of this information is structure and there are relationships between the data. Scalability was also an important consideration. Hosting will be chosen between [PlanetScale](https://planetscale.com/) or [Filess](https://filess.io/).

### Version Control
Git will be the main VC used for collaborative development and tracking changes.


### Other Tools
Visual Studio Code will be the primary development tool. Python, Git, and other extensions will be used to assist in development and version control.
Hi
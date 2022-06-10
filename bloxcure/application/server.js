const express = require("express");
var cors = require("cors");
const cookieparser = require("cookie-parser");
const middlewares = require("./middlewares/app.middleware");
const adminController = require("./controllers/admin.controller");
const patientController = require("./controllers/patient.controller");
const doctorController = require("./controllers/doctor.controller");

const app = express();
app.use(cors({ origin: "*" }));
app.use(cookieparser());
const PORT = 3000;
// Frontend test data
// const userdata = require("./frontend test data/patientregisterdata.json");
// const x509Identity = require("./frontend test data/x509Identityadmin.json");
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// automaticall do parsing for json comming from client
app.use(express.json());

app.use(middlewares.userAuthentication);

app.use((req, res, next) => {
  console.log(req.body.hospitalID);
  console.log(req.body.x509Identity);
  console.log(req.body.userID);
  next();
});

app.post("/admin/login", adminController.adminLogin);
app.post("/register/patient", adminController.patientRegister);
app.post("/register/doctor", adminController.doctorRegister);
app.post("/patient/enroll", patientController.patientEnroll);
app.post("/patient/login", patientController.patientLogin);
app.get(
  "/patient/access-to-doctor-list",
  patientController.doctorsPermissionGranted
);
app.post(
  "/patient/grant-access-to-doctor",
  patientController.grantAccessToDoctor
);
app.post("/doctor/enroll", doctorController.doctorEnroll);
app.post("/doctor/login", doctorController.doctorLogin);
app.listen(PORT, () => {
  console.log(`Listening at port: ${PORT}`);
  console.log(`zeeshan http://192.168.78.173:${PORT}`);
  console.log(`ahmad http://192.168.243.173:${PORT}`);
});

const express = require("express");
var cors = require("cors");
const adminController = require("./controllers/admin.controller");
const patientController = require("./controllers/patient.controller");
const doctorController = require("./controllers/doctor.controller");

const app = express();
app.use(cors({ origin: "*" }));
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

app.post("/admin/login", adminController.adminLogin);
app.post("/register/patient", adminController.patientRegister);
app.post("/register/doctor", adminController.doctorRegister);
app.post("/patient/enroll", patientController.patientEnroll);
app.post("/patient/login", patientController.patientLogin);
app.post("/doctor/enroll", doctorController.doctorEnroll);
app.post("/doctor/login", doctorController.doctorLogin);
app.listen(PORT, () => {
  console.log(`Listening at port: ${PORT}`);
  console.log(`zeeshan http://192.168.78.173:${PORT}`);
  console.log(`ahmad http://192.168.243.173:${PORT}`);
});

const appModel = require("../models/app.model");
const patientModel = require("../models/patient.model");

async function doctorEnroll(req, res) {
  let doctorID = req.body.userID;
  let secret = req.body.secret;
  let hospitalID = req.body.hospitalID;
  let usercredantials = await patientModel.enrollMySelf(
    doctorID,
    secret,
    hospitalID
  );
  res.json(usercredantials);
}
async function doctorLogin(req, res) {
  const doctorID = req.body.userID;
  console.log(doctorID);
  const x509Identity = req.body.x509Identity;
  const hospitalID = appModel.getHospitalID(x509Identity);
  let result = await appModel.queryTransaction(
    doctorID,
    x509Identity,
    hospitalID,
    "DoctorContract",
    "queryDoctor"
  );

  res.json(result);
  res.status(201);
}

module.exports = {
  doctorEnroll,
  doctorLogin,
};

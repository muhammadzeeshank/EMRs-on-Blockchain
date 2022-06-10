const appModel = require("../models/app.model");
const patientModel = require("../models/patient.model");

async function doctorEnroll(req, res) {
  let doctorID = req.body.userID;
  let secret = req.body.secret;
  let hospitalID = req.body.hospitalID;
  try {
    let usercredantials = await patientModel.enrollMySelf(
      doctorID,
      secret,
      hospitalID
    );
    res.status(201);
    res.json(usercredantials);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}
async function doctorLogin(req, res) {
  const doctorID = req.body.userID;
  const x509Identity = req.body.x509Identity;
  const hospitalID = appModel.getHospitalID(x509Identity);
  try {
    let result = await appModel.queryTransaction(
      doctorID,
      x509Identity,
      hospitalID,
      "DoctorContract",
      "queryDoctor"
    );
    generateAuthToken(req, res);
    res.status(201);
    res.json(result);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}

module.exports = {
  doctorEnroll,
  doctorLogin,
};

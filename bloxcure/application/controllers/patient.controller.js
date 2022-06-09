const patientModel = require("../models/patient.model");
const appModel = require("../models/app.model");

async function patientEnroll(req, res) {
  let patientID = req.body.userID;
  let secret = req.body.secret;
  let hospitalID = req.body.hospitalID;
  let patientcredantials = await patientModel.enrollMySelf(
    patientID,
    secret,
    hospitalID
  );
  res.json(patientcredantials);
}
async function patientLogin(req, res) {
  let patientID = req.body.userID;
  let x509Identity = req.body.x509Identity;
  let hospitalID = req.body.hospitalID;

  let result = await appModel.queryTransaction(
    patientID,
    x509Identity,
    hospitalID,
    "PatientContract",
    "queryPatient"
  );

  res.json(result);
  res.status(201);
}

module.exports = {
  patientEnroll,
  patientLogin,
};
/***************for patient**************
* For first time
userID, TempSecrteKey and hospitalID comes from frontend
1) enrollMySelf(userID, TempSecretKey, hospitalID)
save x509identity on frontend in wallet

* For other times
 userID, x509Identity and hospitalID  comes from frontend
1) buildWallet(x509identity)
2) connectToFabric(patients's hospitalID,userID,wallet, contractName:"PatientContract")
3) registerUser() or other operation

end gateway.disconnect()
******************************************/

// let patientcredantials = await patientModel.enrollMySelf(
//   "PID6",
//   "WUtCdAjBnHav",
//   1
// );

// // this is to be done on the frontend
// await apputils.buildWallet(
//   patientcredantials.userID,
//   patientcredantials.x509Identity
// );

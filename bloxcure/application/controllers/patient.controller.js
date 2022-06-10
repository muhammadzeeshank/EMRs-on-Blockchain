const patientModel = require("../models/patient.model");
const appModel = require("../models/app.model");

async function patientEnroll(req, res) {
  let patientID = req.body.userID;
  let secret = req.body.secret;
  let hospitalID = req.body.hospitalID;
  try {
    let patientcredantials = await patientModel.enrollMySelf(
      patientID,
      secret,
      hospitalID
    );
    res.status(201);
    res.json(patientcredantials);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}
async function patientLogin(req, res) {
  let patientID = req.body.userID;
  let x509Identity = req.body.x509Identity;
  let hospitalID = req.body.hospitalID;
  try {
    let result = await appModel.queryTransaction(
      patientID,
      x509Identity,
      hospitalID,
      "PatientContract",
      "queryPatient"
    );
    appModel.generateAuthToken(req, res);
    res.status(201);
    res.json(result);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}

// method to give edit permission to doctor
async function grantAccessToDoctor(req, res) {
  //******** just for testing. Remove it after adding JWT logic
  let patientID = req.body.userID;
  let x509Identity = req.body.x509Identity;
  let hospitalID = req.body.hospitalID;
  // const hospitalID = appModel.getHospitalID(x509Identity);
  //*********
  let doctorID = req.body.doctorID;
  try {
    if (!doctorID) {
      throw "[-] Error: doctorID not provided!";
    }

    let result = await appModel.invokeTransaction(
      patientID,
      x509Identity,
      hospitalID,
      "PatientContract",
      "grantAccessToDoctor",
      doctorID
    );
    res.status(201).send(`Access granted to doctor: ${doctorID}`);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}
// method to display doctors that have edit permissions
async function doctorsPermissionGranted(req, res) {
  //******** just for testing. Remove it after adding JWT logic
  let patientID = req.body.userID;
  let x509Identity = req.body.x509Identity;
  const hospitalID = appModel.getHospitalID(x509Identity);
  //*********
  try {
    let result = await appModel.queryTransaction(
      patientID,
      x509Identity,
      hospitalID,
      "PatientContract",
      "queryDoctorPermissionGranted"
    );
    res.status(201);
    res.json(result);
  } catch (error) {
    res.status(400).send(`Invalid response:${error}`);
  }
}

module.exports = {
  patientEnroll,
  patientLogin,
  doctorsPermissionGranted,
  grantAccessToDoctor,
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

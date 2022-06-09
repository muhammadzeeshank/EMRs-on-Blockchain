const adminModel = require("../models/admin.model");
const appModel = require("../models/app.model");

// only for testing. Remove it after adding JWT logic
let x509Identity = require("../frontend test data/x509Identityadmin.json");
x509Identity = x509Identity[0];
const adminID = "hospital1admin";

// method to calculate JWT token and to return dashboard data
async function adminLogin(req, res) {
  let adminID = req.body.userID;
  let x509Identity = req.body.x509Identity;

  const wallet = await appModel.buildWallet(adminID, x509Identity);

  const hospitalID = appModel.getHospitalID(x509Identity);
  // method to connect to fabric network
  [ca, gateway, contract] = await appModel.connectToFabric(
    hospitalID,
    adminID,
    wallet,
    "AdminContract"
  );
  let result = await contract.evaluateTransaction("queryAllPatients");
  console.log(`Transaction has been evaluated`);
  await gateway.disconnect();

  // WORK: add logic to assign JWT token
  res.status(201);
  res.json(JSON.parse(result.toString()));
}

// method to register a patient
async function patientRegister(req, res) {
  let attributes = req.body;
  console.log(attributes);
  // just for testing. Remove it after adding JWT logic

  const wallet = await appModel.buildWallet(adminID, x509Identity);
  const hospitalID = appModel.getHospitalID(x509Identity);

  // method to connect to fabric network
  [ca, gateway, contract] = await appModel.connectToFabric(
    hospitalID,
    adminID,
    wallet,
    "AdminContract"
  );
  let userCredToEnroll = await adminModel.registerPatient(
    ca,
    contract,
    attributes,
    wallet,
    hospitalID,
    adminID
  );
  gateway.disconnect();
  res.json(userCredToEnroll);
  res.status(201);
}

// method to register a doctor
async function doctorRegister(req, res) {
  let attributes = req.body;
  console.log(attributes);
  // just for testing. Remove it after adding JWT logic

  const wallet = await appModel.buildWallet(adminID, x509Identity);
  const hospitalID = appModel.getHospitalID(x509Identity);
  console.log(adminID);
  // method to connect to fabric network
  [ca, gateway, contract] = await appModel.connectToFabric(
    hospitalID,
    adminID,
    wallet,
    "AdminContract"
  );
  let userCredToEnroll = await adminModel.registerDoctor(
    ca,
    contract,
    attributes,
    wallet,
    hospitalID,
    adminID
  );
  gateway.disconnect();
  res.json(userCredToEnroll);
}
module.exports = {
  adminLogin,
  patientRegister,
  doctorRegister,
};

// main();
//   /***************for admin**************
//  userID and x509Identity object comes from frontend
// 1) buildWallet(x509identity)
// 2) getHospitalID(x509Identity)
// 3) connectToFabric(admin's hospitalID,userID:"admin",wallet, contractName:"AdminContract")
// 4) contract.evaluateTransaction("queryAllPatients")
// 5) registerPatient() or other operation

// end gateway.disconnect()
// ****************************************/
// const wallet = await appModel.buildWallet("admin", x509Identity[0]);
// const hospitalID = appModel.getHospitalID(x509Identity[0]);

//   // method to login
// [ca, gateway, contract] = await appModel.connectToFabric(
//   hospitalID,
//   "admin",
//   wallet,
//   "AdminContract"
// );

//   // method to register user
//   [secret, userID] = await adminModel.registerPatient(
//     ca,
//     gateway,
//     contract,
//     userdata[0],
//     wallet,
//     hospitalID
//   );
//   console.log(secret, userID);

// let result = await contract.evaluateTransaction("queryAllPatients");
// console.log(
//   `Transaction has been evaluated, result is: ${result.toString()}`
// );

// let result1 = await contract.evaluateTransaction("queryAllPatients");
// console.log(
//   `\n\nTransaction has been evaluated, result is: ${result1.toString()}`
// );

// await gateway.disconnect(); // to logout

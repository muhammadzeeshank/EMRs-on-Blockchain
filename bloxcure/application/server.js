const adminutils = require("./admin_utils");
const patientutils = require("./patient_utils");
const userdata = require("./registerdata.json");
async function main() {
  //   console.log(JSON.parse(userdata[0]));
  //   [secret, userID] = await adminutils.registerUser(userdata[0]);
  //   console.log(secret, userID);
  patientutils.enrollMySelf("PID10", "yYrWHtxVJRzd", userdata[0].hospitalID);
}
main();

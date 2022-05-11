"use strict";

const BloxCure = require("./bloxcure");
const { Contract } = require("fabric-contract-api");
let patientData = require("./PatientData");
class AdminContract extends BloxCure {
  async patientExists(ctx, patientID) {
    const patientAsBytes = await ctx.stub.getState(patientID); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`[-] ${patientID} does not exist`);
    } else {
      console.log(`[+] Patient with ${patientID} exists`);
    }
  }
}
module.exports = AdminContract;

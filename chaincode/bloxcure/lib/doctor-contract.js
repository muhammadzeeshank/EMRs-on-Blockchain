"use strict";

const BloxCure = require("./bloxcure");

class DoctorContract extends BloxCure {
  // default method that is executed before every transaction
  // this method limits access control of this smartcontract only to doctor
  async beforeTransaction(ctx) {
    if (!ctx.clientIdentity.assertAttributeValue("role", "doctor")) {
      throw new Error(`[-] Only doctor has access to this method`);
    }
  }

  // method to display all the information of patient to him/her self
  async queryDoctor(ctx) {
    let doctorID = await super.getClientId(ctx);
    return await super.queryDoctor(ctx, doctorID);
  }

  async queryPatient(ctx, patientID) {
    return await super.queryPatient(ctx, patientID);
  }
  async doctorClientID(ctx) {
    return await super.getClientId(ctx);
  }
}
module.exports = DoctorContract;

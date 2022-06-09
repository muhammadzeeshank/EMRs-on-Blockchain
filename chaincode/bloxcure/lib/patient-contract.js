"use strict";

const BloxCure = require("./bloxcure");

class PatientContract extends BloxCure {
  // default method that is executed before every transaction
  // this method limits access controle of this smartcontract only to patient
  async beforeTransaction(ctx) {
    if (!ctx.clientIdentity.assertAttributeValue("role", "patient")) {
      throw new Error(`[-] Only patient has access to this method`);
    }
  }

  // method to display all the information of patient to him/her self
  async queryPatient(ctx) {
    let patientID = await super.getClientId(ctx);
    return await super.queryPatient(ctx, patientID);
  }
  async qPatient(ctx) {
    return await super.getClientId(ctx);
  }
}
module.exports = PatientContract;

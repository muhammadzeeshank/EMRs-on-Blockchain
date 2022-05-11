/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
let initialData = require("./initialData.json");

class BloxCure extends Contract {
  // initLedger()
  // writeData()
  // readData()
  async initLedger(ctx) {
    console.info("============= START : Initialize Ledger ===========");

    for (let i = 0; i < initialData.length; i++) {
      initialData[i].docType = "patient";
      await ctx.stub.putState(
        `PID${i}`,
        Buffer.from(JSON.stringify(initialData[i]))
      );
    }
    console.info("============= END : Initialize Ledger ===========");
  }
  async queryPatient(ctx, patientID) {
    const patientAsBytes = await ctx.stub.getState(patientID); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientID} does not exist`);
    }
    let patientData = JSON.parse(patientAsBytes.toString());
    patientData = {
      patientID: patientID,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      age: patientData.age,
      phoneNumber: patientData.phoneNumber,
      address: patientData.address,
      bloodGroup: patientData.bloodGroup,
      allergies: patientData.allergies,
      symptoms: patientData.symptoms,
      diagnosis: patientData.diagnosis,
      treatment: patientData.treatment,
      followUp: patientData.followUp,
      permissionGranted: patientData.permissionGranted,
      password: patientData.password,
      pwdTemp: patientData.pwdTemp,
    };
    return patientData;
  }

  async patientExists(ctx, patientID) {
    const patientAsBytes = await ctx.stub.getState(patientID); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`[-] ${patientID} does not exist`);
    }
    return `[+] Patient with ${patientID} exists`;
  }
}

module.exports = BloxCure;

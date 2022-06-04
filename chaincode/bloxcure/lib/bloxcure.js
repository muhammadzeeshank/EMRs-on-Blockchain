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
      CNIC: patientData.CNIC,
      birthDate: patientData.birthDate,
      phoneNumber: patientData.phoneNumber,
      address: patientData.address,
      bloodGroup: patientData.bloodGroup,
      allergies: patientData.allergies,
      symptoms: patientData.symptoms,
      diagnosis: patientData.diagnosis,
      treatment: patientData.treatment,
      followUp: patientData.followUp,
      permissionGranted: patientData.permissionGranted,
      pwdTemp: patientData.pwdTemp,
    };
    return patientData;
  }

  async patientExists(ctx, patientID) {
    const patientAsBytes = await ctx.stub.getState(patientID); // get the patient from chaincode state
    if (!patientAsBytes || patientAsBytes.length === 0) {
      return false;
    }
    return true;
  }

  async getAllPatientResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString("utf8"));

        if (isHistory && isHistory === true) {
          jsonRes.Timestamp = res.value.timestamp;
        }
        jsonRes.Key = res.value.key;

        try {
          jsonRes.Record = JSON.parse(res.value.value.toString("utf8"));
        } catch (err) {
          console.log(err);
          jsonRes.Record = res.value.value.toString("utf8");
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log("end of data");
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }
  async getClientId(ctx) {
    const clientIdentity = ctx.clientIdentity.getID();
    let identity = clientIdentity.split("::")[1].split("::")[0];
    let index = identity.search("CN") + 3;
    return identity.slice(index);
  }
}

module.exports = BloxCure;

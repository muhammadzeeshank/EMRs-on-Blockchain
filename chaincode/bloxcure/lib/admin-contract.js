"use strict";

const BloxCure = require("./bloxcure");
let Patient = require("./PatientData");
class AdminContract extends BloxCure {
  // default method that is executed before every transaction
  // this method limits access controle of this smartcontract only to admin
  async beforeTransaction(ctx) {
    const clientIdentity = ctx.clientIdentity.getID();
    if (!clientIdentity.includes("admin")) {
      throw new Error(`[-] Only admin has access to this method`);
    }
  }

  //Returns the last patientId in the set
  async getLatestPatientId(ctx) {
    let allResults = await this.queryAllPatients(ctx);
    return allResults[allResults.length - 1].patientID;
  }

  // method which displays allowed patient data to Admin
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
    };
    return patientData;
  }

  // method to create a new patient in couchDB
  async createPatient(ctx, args) {
    args = JSON.parse(args);

    if (args.password === null || args.password === "") {
      throw new Error(
        `Empty or null values should not be passed for password parameter`
      );
    }

    let newPatient = await new Patient(
      args.patientID,
      args.firstName,
      args.lastName,
      args.password,
      args.age,
      args.phoneNumber,
      args.emergPhoneNumber,
      args.address,
      args.bloodGroup,
      args.changedBy,
      args.allergies
    );
    // return newPatient;
    const exists = await super.patientExists(ctx, newPatient.patientID);
    if (exists) {
      throw new Error(`The patient ${newPatient.patientID} already exists`);
    }
    const buffer = Buffer.from(JSON.stringify(newPatient));
    await ctx.stub.putState(newPatient.patientID, buffer);
    return `[+] Patiend with patientID ${newPatient.patientID} created`;
  }

  // method to get all patients basic information
  async queryAllPatients(ctx) {
    let resultsIterator = await ctx.stub.getStateByRange("", "");
    let asset = await super.getAllPatientResults(resultsIterator, false);

    for (let i = 0; i < asset.length; i++) {
      const obj = asset[i];
      asset[i] = {
        patientId: obj.Key,
        firstName: obj.Record.firstName,
        lastName: obj.Record.lastName,
        phoneNumber: obj.Record.phoneNumber,
        emergPhoneNumber: obj.Record.emergPhoneNumber,
      };
    }

    return asset;
  }

  // only for testing
  async writeData(ctx, key, value) {
    await ctx.stub.putState(key, Buffer.from(value));
  }
  // only for testing
  async qPatient(ctx) {
    return ctx.clientIdentity.getID(ctx);
  }
}
module.exports = AdminContract;

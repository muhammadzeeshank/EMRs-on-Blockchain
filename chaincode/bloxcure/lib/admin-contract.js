"use strict";

const BloxCure = require("./bloxcure");
let Patient = require("./PatientData");
let Doctor = require("./DoctorData");
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
    if (allResults.length === 0) {
      return "PID0";
    } else {
      return allResults[allResults.length - 1].patientID;
    }
  }

  //Returns the last doctorId in the set
  async getLatestDoctorId(ctx) {
    let allResults = await this.queryAllDoctors(ctx);
    if (allResults.length === 0) {
      return "DID0";
    } else {
      return allResults[allResults.length - 1].doctorID;
    }
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
      gender: patientData.gender,
      phoneNumber: patientData.phoneNumber,
      emergPhoneNumber: patientData.emergPhoneNumber,
      mspID: patientData.mspID,
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
      args.CNIC,
      args.birthDate,
      args.gender,
      args.phoneNumber,
      args.emergPhoneNumber,
      args.nationality,
      args.address,
      args.blood,
      args.mspID
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

  // method to create a new doctor in couchDB
  async createDoctor(ctx, args) {
    args = JSON.parse(args);

    if (args.password === null || args.password === "") {
      throw new Error(
        `Empty or null values should not be passed for password parameter`
      );
    }

    let newDoctor = await new Doctor(
      args.doctorID,
      args.firstName,
      args.lastName,
      args.CNIC,
      args.gender,
      args.phoneNumber,
      args.speciality,
      args.mspID
    );
    // return newPatient;
    const exists = await super.patientExists(ctx, newDoctor.doctorID);
    if (exists) {
      throw new Error(`The doctor ${newDoctor.doctorID} already exists`);
    }
    const buffer = Buffer.from(JSON.stringify(newDoctor));
    await ctx.stub.putState(newDoctor.doctorID, buffer);
    return `[+] Patiend with patientID ${newDoctor.doctorID} created`;
  }

  // method to get all patients basic information
  async queryAllPatients(ctx) {
    let resultsIterator = await ctx.stub.getStateByRange("", "");
    let asset = await super.getAllUserResults(resultsIterator, false);
    let patients = [];
    for (let i = 0; i < asset.length; i++) {
      const obj = asset[i];
      if (obj.Record.docType == "patient") {
        patients.push({
          patientID: obj.Key,
          firstName: obj.Record.firstName,
          lastName: obj.Record.lastName,
          gender: obj.Record.gender,
          phoneNumber: obj.Record.phoneNumber,
          emergPhoneNumber: obj.Record.emergPhoneNumber,
          mspID: obj.Record.mspID,
        });
      }
    }

    return patients;
  }

  // method to get all doctors basic information
  async queryAllDoctors(ctx) {
    let resultsIterator = await ctx.stub.getStateByRange("", "");
    let asset = await super.getAllUserResults(resultsIterator, false);
    let doctors = [];
    for (let i = 0; i < asset.length; i++) {
      const obj = asset[i];
      if (obj.Record.docType == "doctor") {
        doctors.push({
          doctorID: obj.Key,
          firstName: obj.Record.firstName,
          lastName: obj.Record.lastName,
          gender: obj.Record.gender,
          phoneNumber: obj.Record.phoneNumber,
          speciality: obj.Record.speciality,
          mspID: obj.Record.mspID,
        });
      }
    }

    return doctors;
  }

  // method to get all users basic information
  async queryAllUsers(ctx) {
    let resultsIterator = await ctx.stub.getStateByRange("", "");
    let asset = await super.getAllUserResults(resultsIterator, false);
    let patients = [];
    let doctors = [];
    for (let i = 0; i < asset.length; i++) {
      const obj = asset[i];
      if (obj.Record.docType == "patient") {
        patients.push({
          patientID: obj.Key,
          firstName: obj.Record.firstName,
          lastName: obj.Record.lastName,
          gender: obj.Record.gender,
          phoneNumber: obj.Record.phoneNumber,
          emergPhoneNumber: obj.Record.emergPhoneNumber,
          mspID: obj.Record.mspID,
        });
      } else if (obj.Record.docType == "doctor") {
        doctors.push({
          doctorID: obj.Key,
          firstName: obj.Record.firstName,
          lastName: obj.Record.lastName,
          gender: obj.Record.gender,
          phoneNumber: obj.Record.phoneNumber,
          speciality: obj.Record.speciality,
          mspID: obj.Record.mspID,
        });
      }
    }
    let result = { patients, doctors };

    return result;
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

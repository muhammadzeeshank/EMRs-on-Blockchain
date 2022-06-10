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

  // method to read the list of doctors permission has been granted
  async queryDoctorPermissionGranted(ctx) {
    let patientID = await super.getClientId(ctx);
    console.log(`PatientID: ${patientID}`);
    // Get the patient asset from world state
    const patientAsBytes = await ctx.stub.getState(patientID);
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientID} does not exist`);
    }
    let patient = JSON.parse(patientAsBytes.toString());
    let doctorIDs = patient.doctorPermissionGranted;
    // Get the doctors asset from world state
    let doctorsData = [];
    for (let i = 0; i < doctorIDs.length; i++) {
      let doctor = await super.queryDoctor(ctx, doctorIDs[i]);
      doctorsData.push({
        doctorID: doctor.doctorID,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        phoneNumber: doctor.phoneNumber,
        speciality: doctor.speciality,
      });
    }

    return doctorsData;
  }

  // method to grant Patients medical record access to doctor
  async grantAccessToDoctor(ctx, doctorID) {
    let patientID = await super.getClientId(ctx);

    if (!(await super.doctorExists(ctx, doctorID))) {
      throw new Error(`[-] Doctor with ${doctorID} does not exist!`);
    }

    // Get the patient asset from world state
    const patientAsBytes = await ctx.stub.getState(patientID);
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientID} does not exist`);
    }
    let patient = JSON.parse(patientAsBytes.toString());

    // unique doctorIDs in doctorPermissionGranted
    if (!patient.doctorPermissionGranted.includes(doctorID)) {
      patient.doctorPermissionGranted.push(doctorID);
      patient.changedBy.push(doctorID);
    }
    const buffer = Buffer.from(JSON.stringify(patient));
    // Update the ledger with updated doctorPermissionGranted
    await ctx.stub.putState(patientID, buffer);
    return true;
  }

  // method to get back edit access from doctor
  async revokeAccessFromDoctor(ctx, doctorID) {
    let patientID = await super.getClientId(ctx);

    if (!(await super.doctorExists(ctx, doctorID))) {
      throw new Error(`[-] Doctor with ${doctorID} does not exist!`);
    }

    // Get the patient asset from world state
    const patientAsBytes = await ctx.stub.getState(patientID);
    if (!patientAsBytes || patientAsBytes.length === 0) {
      throw new Error(`${patientID} does not exist`);
    }
    let patient = JSON.parse(patientAsBytes.toString());

    // Remove the doctor if existing
    if (patient.doctorPermissionGranted.includes(doctorID)) {
      patient.doctorPermissionGranted = patient.doctorPermissionGranted.filter(
        (doctor) => doctor !== doctorID
      );
    }
    const buffer = Buffer.from(JSON.stringify(patient));
    // Update the ledger with updated doctorPermissionGranted
    await ctx.stub.putState(patientID, buffer);
  }
}
module.exports = PatientContract;

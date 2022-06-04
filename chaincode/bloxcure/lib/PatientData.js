const crypto = require("crypto");

class PatientData {
  constructor(
    patientID,
    firstName,
    lastName,
    CNIC,
    birthDate,
    phoneNumber,
    emergPhoneNumber,
    address,
    bloodGroup,
    changedBy = "",
    allergies = "",
    symptoms = "",
    diagnosis = "",
    treatment = "",
    followUp = ""
  ) {
    this.patientID = patientID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.CNIC = CNIC;
    this.birthDate = birthDate;
    this.phoneNumber = phoneNumber;
    this.emergPhoneNumber = emergPhoneNumber;
    this.address = address;
    this.bloodGroup = bloodGroup;
    this.changedBy = changedBy;
    this.allergies = allergies;
    this.symptoms = symptoms;
    this.diagnosis = diagnosis;
    this.treatment = treatment;
    this.followUp = followUp;
    this.pwdTemp = true;
    this.permissionGranted = [];
    return this;
  }
}
module.exports = PatientData;

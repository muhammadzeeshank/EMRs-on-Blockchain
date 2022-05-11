const crypto = require("crypto");

class PatientData {
  constructor(
    patientId,
    firstName,
    lastName,
    password,
    age,
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
    this.patientId = patientId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = crypto.createHash("sha256").update(password).digest("hex");
    this.age = age;
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

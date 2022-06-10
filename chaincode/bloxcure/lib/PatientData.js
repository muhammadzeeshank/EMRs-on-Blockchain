class PatientData {
  constructor(
    patientID,
    firstName,
    lastName,
    CNIC,
    birthDate,
    gender,
    phoneNumber,
    emergPhoneNumber,
    nationality,
    address,
    blood,
    mspID,
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
    this.gender = gender;
    this.phoneNumber = phoneNumber;
    this.emergPhoneNumber = emergPhoneNumber;
    this.nationality = nationality;
    this.address = address;
    this.blood = blood;
    this.docType = "patient";
    this.mspID = mspID;
    this.allergies = allergies;
    this.symptoms = symptoms;
    this.diagnosis = diagnosis;
    this.treatment = treatment;
    this.followUp = followUp;
    this.changedBy = [];
    this.doctorPermissionGranted = [];
    this.adminPermissionGranted = [];
    return this;
  }
}
module.exports = PatientData;

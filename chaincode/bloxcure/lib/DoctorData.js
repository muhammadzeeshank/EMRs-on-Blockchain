class DoctorData {
  constructor(
    doctorID,
    firstName,
    lastName,
    CNIC,
    gender,
    phoneNumber,
    speciality,
    mspID
  ) {
    this.doctorID = doctorID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.CNIC = CNIC;
    this.gender = gender;
    this.phoneNumber = phoneNumber;
    this.docType = "doctor";
    this.speciality = speciality;
    this.mspID = mspID;
    this.patientPermissionAcquired = [];
    this.adminPermissionGranted = [];
    this.chengedBy = [];
    return this;
  }
}
module.exports = DoctorData;

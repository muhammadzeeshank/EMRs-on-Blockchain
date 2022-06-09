const appModel = require("./app.model");

// method to calculate next available userID
async function getNextPatientID(contract) {
  let result = await contract.evaluateTransaction("getLatestPatientId");
  result = result.toString().match(/\d+/g)[0];
  result = parseInt(result) + 1;
  return "PID" + result;
}
exports.registerPatient = async (
  ca,
  contract,
  attributes,
  wallet,
  hospitalID,
  adminID
) => {
  let userID = "";
  try {
    // const attributes = JSON.parse(attributes);
    const firstName = attributes.firstName;
    const lastName = attributes.lastName;
    const CNIC = attributes.CNIC;
    const birthDate = attributes.birthDate;
    const gender = attributes.gender;
    const phoneNumber = attributes.phoneNumber;
    const emergPhoneNumber = attributes.emergPhoneNumber;
    const address = attributes.address;
    const blood = attributes.blood;
    const nationality = attributes.nationality;
    const role = "patient";

    // build a user object for authenticating with the CA
    const adminUser = await appModel.buildAdminObject(wallet, adminID);

    // calculate next availabe userID
    userID = await getNextPatientID(contract);

    // Register the user
    const secret = await ca.register(
      {
        affiliation: `org${hospitalID}.department1`,
        enrollmentID: userID,
        role: "client",
        attrs: [
          {
            name: "firstName",
            value: firstName,
            ecert: true,
          },
          {
            name: "lastName",
            value: lastName,
            ecert: true,
          },
          {
            name: "CNIC",
            value: CNIC,
            ecert: true,
          },
          {
            name: "role",
            value: role,
            ecert: true,
          },
        ],
      },
      adminUser
    );

    // putting patient data to database
    await contract.submitTransaction(
      "createPatient",
      `{"patientID":"${userID}","CNIC":"${CNIC}","firstName":"${firstName}","lastName":"${lastName}","birthDate":"${birthDate}","gender":"${gender}","phoneNumber":"${phoneNumber}","emergPhoneNumber":"${emergPhoneNumber}","mspID":"hospital${hospitalID}MSP","nationality":"${nationality}","address":"${address}","blood":"${blood}","docType":"${role}"}`
    );
    console.log(
      `Successfully registered user ${userID} and submitted transaction`
    );

    return { userID, secret };
  } catch (error) {
    console.error(`Failed to register user ${userID}: ${error}`);
    process.exit(1);
  }
};

exports.registerDoctor = async (
  ca,
  contract,
  attributes,
  wallet,
  hospitalID,
  adminID
) => {
  let userID = "";
  try {
    const userID = attributes.userID;
    const firstName = attributes.firstName;
    const lastName = attributes.lastName;
    const CNIC = attributes.CNIC;
    const gender = attributes.gender;
    const phoneNumber = attributes.phoneNumber;
    const role = attributes.role;
    const speciality = attributes.speciality;

    // build a user object for authenticating with the CA
    const adminUser = await appModel.buildAdminObject(wallet, adminID);

    // calculate next availabe userID
    // userID = await getNextPatientID(contract);

    // Register the user
    const secret = await ca.register(
      {
        affiliation: `org${hospitalID}.department1`,
        enrollmentID: userID,
        role: "client",
        attrs: [
          {
            name: "userID",
            value: userID,
            ecert: true,
          },
          {
            name: "firstName",
            value: firstName,
            ecert: true,
          },
          {
            name: "lastName",
            value: lastName,
            ecert: true,
          },
          {
            name: "CNIC",
            value: CNIC,
            ecert: true,
          },
          {
            name: "gender",
            value: gender,
            ecert: true,
          },
          {
            name: "role",
            value: role,
            ecert: true,
          },
          {
            name: "speciality",
            value: speciality,
            ecert: true,
          },
        ],
      },
      adminUser
    );

    // putting doctor data to database
    await contract.submitTransaction(
      "createDoctor",
      `{"doctorID":"${userID}","CNIC":"${CNIC}","firstName":"${firstName}","lastName":"${lastName}","gender":"${gender}","phoneNumber":"${phoneNumber}","mspID":"hospital${hospitalID}MSP","speciality":"${speciality}"}`
    );
    console.log(
      `Successfully registered user ${userID} and submitted transaction`
    );

    return { userID, secret };
  } catch (error) {
    console.error(`Failed to register user ${userID}: ${error}`);
    process.exit(1);
  }
};

const path = require("path");
const apputils = require("./app_utils");

// method to calculate next available userID
async function tellPatientID(contract) {
  let result = await contract.evaluateTransaction("getLatestPatientId");
  result = result.toString().match(/\d+/g)[0];
  result = parseInt(result) + 1;
  return "PID" + result;
}
exports.registerUser = async (attributes) => {
  let userID = "";
  try {
    // const attributes = JSON.parse(attributes);
    const firstName = attributes.firstName;
    const lastName = attributes.lastName;
    const CNIC = attributes.CNIC;
    const birthDate = attributes.birthDate;
    const phoneNumber = attributes.phoneNumber;
    const emergPhoneNumber = attributes.emergPhoneNumber;
    const address = attributes.address;
    const bloodGroup = attributes.bloodGroup;

    const hospitalID = attributes.hospitalID;
    const role = attributes.role;

    // load the network configuration
    const ccp = apputils.buildConnectionProfile(`hospital${hospitalID}`);

    // Create a new CA client for interacting with the CA.
    const ca = apputils.buildCAClient(
      ccp,
      `ca.hospital${hospitalID}.example.com`
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await apputils.buildWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(userID);
    if (userIdentity) {
      console.log(
        "An identity for the user userID already exists in the wallet"
      );
      return;
    }

    // build a user object for authenticating with the CA
    const adminUser = await apputils.buildAdminObject(wallet, "admin");

    // connecting to network and getting admin contract
    // to putstate in database
    [contract, gateway] = await apputils.connectAndGetContract(
      "admin",
      ccp,
      wallet,
      "AdminContract"
    );

    // calculate next availabe userID
    userID = await tellPatientID(contract);
    console.log(userID);

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
      `{"patientID":"${userID}","CNIC":"${CNIC}","firstName":"${firstName}","lastName":"${lastName}","birthDate":"${birthDate}","phoneNumber":"${phoneNumber}","emergPhoneNumber":"${emergPhoneNumber}","address":"${address}","bloodGroup":"${bloodGroup}"}`
    );
    console.log(
      `Successfully registered user ${userID} and submitted transaction`
    );

    return [userID, secret];
  } catch (error) {
    console.error(`Failed to register user ${userID}: ${error}`);
    process.exit(1);
  } finally {
    // Disconnect from the gateway.
    await gateway.disconnect();
  }
};

const appModel = require("./app.model");
exports.enrollMySelf = async (userID, secret, hospitalID) => {
  try {
    // load the network configuration
    const ccp = appModel.buildConnectionProfile(`hospital${hospitalID}`);

    // Create a new CA client for interacting with the CA.
    const ca = appModel.buildCAClient(
      ccp,
      `ca.hospital${hospitalID}.example.com`
    );

    const enrollment = await ca.enroll({
      enrollmentID: userID,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: `hospital${hospitalID}MSP`,
      type: "X.509",
    };
    // await wallet.put(userID, x509Identity);
    console.log(`Successfully enrolled user ${userID}`);
    return { userID, x509Identity };
  } catch (error) {
    throw `Failed to enroll user userID: ${error}`;
  }
};

const path = require("path");
const apputils = require("./app_utils");
exports.enrollMySelf = async (userID, secret, hospitalID) => {
  try {
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
    await wallet.put(userID, x509Identity);
    console.log(
      `Successfully enrolled user ${userID} and imported it into the wallet`
    );
  } catch (error) {
    console.error(`Failed to enroll user userID: ${error}`);
    process.exit(1);
  }
};

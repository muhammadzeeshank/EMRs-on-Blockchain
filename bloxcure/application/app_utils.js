const fs = require("fs");
const path = require("path");
const { Wallets, Gateway } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

exports.buildConnectionProfile = (hospital) => {
  const ccpPath = path.resolve(
    __dirname,
    "..",
    "..",
    "initial-network",
    "organizations",
    "peerOrganizations",
    `${hospital}.example.com`,
    `connection-${hospital}.json`
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
  return ccp;
};

exports.buildWallet = async (walletPath) => {
  // Create a new file system based wallet for managing identities.
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);
  return wallet;
};

exports.buildCAClient = (ccp, caHostUrl) => {
  // Create a new CA client for interacting with the CA.
  const caURL = ccp.certificateAuthorities[caHostUrl].url;
  const ca = new FabricCAServices(caURL);

  return ca;
};

exports.buildAdminObject = async (wallet, adminID) => {
  // Check to see if we've already enrolled the admin user.
  const adminIdentity = await wallet.get(adminID);
  if (!adminIdentity) {
    console.log(
      'An identity for the admin user "admin" does not exist in the wallet'
    );
    console.log("Run the enrollAdmin.js application before retrying");
    return;
  }

  // build a user object for authenticating with the CA
  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, adminID);
  return adminUser;
};

exports.connectAndGetContract = async (userID, ccp, wallet, contract) => {
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: userID,
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork("islamabadhospitalschannel");

  // Get the contract from the network.
  return [network.getContract("bloxcure", contract), gateway];
};

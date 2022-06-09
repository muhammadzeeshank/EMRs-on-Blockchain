const fs = require("fs");
const path = require("path");
const { Wallets, Gateway } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");

function buildConnectionProfile(hospital) {
  const ccpPath = path.resolve(
    __dirname,
    "..",
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
}

async function buildWallet(userID, x509Identity) {
  // Create a new file system based wallet for managing identities.
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  await wallet.put(userID, x509Identity);
  console.log(`Wallet path: ${walletPath}`);
  return wallet;
}

function buildCAClient(ccp, caHostUrl) {
  // Create a new CA client for interacting with the CA.
  const caURL = ccp.certificateAuthorities[caHostUrl].url;
  const ca = new FabricCAServices(caURL);

  return ca;
}

async function buildAdminObject(wallet, adminID) {
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
  const adminUser = await provider.getUserContext(
    adminIdentity,
    adminIdentity[0]
  );
  return adminUser;
}

async function connectAndGetContract(userID, ccp, wallet, contract) {
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
}

// method to login
// don't forget to call gateway.disconnect() after using this method
async function connectToFabric(hospitalID, userID, wallet, contractName) {
  // load the network configuration
  const ccp = buildConnectionProfile(`hospital${hospitalID}`);

  // Create a new CA client for interacting with the CA.
  const ca = buildCAClient(ccp, `ca.hospital${hospitalID}.example.com`);

  // connecting to network and getting admin contract
  // to putstate in database
  [contract, gateway] = await connectAndGetContract(
    userID,
    ccp,
    wallet,
    contractName
  );

  return [ca, gateway, contract];
}

// method to read mspId from x509Identity certificate
function getHospitalID(x509Identity) {
  let mspid = x509Identity.mspId;
  let hospitalID = mspid.toString().match(/\d+/g)[0];
  return parseInt(hospitalID);
}

// method to invoke transaction
// used when updating ledger
async function invokeTransaction(
  userID,
  x509Identity,
  hospitalID,
  contractName,
  method,
  parameters
) {
  try {
    const wallet = await buildWallet(userID, x509Identity);
    // method to connect to fabric network
    [ca, gateway, contract] = await connectToFabric(
      hospitalID,
      userID,
      wallet,
      contractName
    );
    let result = await contract.submitTransaction(method, parameters);
    console.log(`Transaction has been evaluated`);
    await gateway.disconnect();

    return JSON.parse(result.toString());
  } catch (error) {
    console.error(
      `[-] query transaction of ${userID} is failed Error: ${error}`
    );
    process.exit(1);
  }
}

// method to query transaction
// used only for reading ledger
async function queryTransaction(
  userID,
  x509Identity,
  hospitalID,
  contractName,
  method,
  parameters = ""
) {
  try {
    const wallet = await buildWallet(userID, x509Identity);
    // method to connect to fabric network
    [ca, gateway, contract] = await connectToFabric(
      hospitalID,
      userID,
      wallet,
      contractName
    );
    let result = await contract.evaluateTransaction(method, parameters);
    console.log(`Transaction has been evaluated`);
    await gateway.disconnect();

    return JSON.parse(result.toString());
  } catch (error) {
    console.error(
      `[-] query transaction of ${userID} is failed Error: ${error}`
    );
    process.exit(1);
  }
}
module.exports = {
  buildConnectionProfile,
  buildAdminObject,
  buildWallet,
  buildCAClient,
  connectAndGetContract,
  connectToFabric,
  getHospitalID,
  invokeTransaction,
  queryTransaction,
};

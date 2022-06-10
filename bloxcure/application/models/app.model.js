const fs = require("fs");
const path = require("path");

const { Gateway, Wallet } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const jwt = require("jsonwebtoken");

function buildConnectionProfile(hospital) {
  try {
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
  } catch (error) {
    throw `[-] buildConnectionProfile failed. Error: ${error}`;
  }
}

// async function buildWallet(userID, x509Identity) {
//   try {
//     // Create a new file system based wallet for managing identities.
//     const walletPath = path.join(process.cwd(), "wallet");
//     const wallet = await Wallets.newFileSystemWallet(walletPath);
//     await wallet.put(userID, x509Identity);
//     console.log(`Wallet path: ${walletPath}`);
//     return wallet;
//   } catch (error) {
//     throw `[-] buildWallet failed. Error: ${error}`;
//   }
// }

function buildCAClient(ccp, caHostUrl) {
  try {
    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities[caHostUrl].url;
    const ca = new FabricCAServices(caURL);

    return ca;
  } catch (error) {
    throw `[-] buildCAClient failed. Error: ${error}`;
  }
}

async function buildAdminObject(x509Identity, adminID) {
  try {
    const walletStore = [adminID, x509Identity];
    const wallet = new Wallet(walletStore);

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(x509Identity.type);
    const adminUser = await provider.getUserContext(x509Identity, adminID);
    return adminUser;
  } catch (error) {
    throw `[-] buildAdminObject failed. Error: ${error}`;
  }
}

async function connectAndGetContract(x509Identity, ccp, contract) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      identity: x509Identity,
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("islamabadhospitalschannel");

    // Get the contract from the network.
    return [network.getContract("bloxcure", contract), gateway];
  } catch (error) {
    throw `[-] connectAndGetContract failed. Error: ${error}`;
  }
}

// method to login
// don't forget to call gateway.disconnect() after using this method
async function connectToFabric(hospitalID, x509Identity, contractName) {
  try {
    // load the network configuration
    const ccp = buildConnectionProfile(`hospital${hospitalID}`);

    // Create a new CA client for interacting with the CA.
    const ca = buildCAClient(ccp, `ca.hospital${hospitalID}.example.com`);

    // connecting to network and getting admin contract
    // to putstate in database
    [contract, gateway] = await connectAndGetContract(
      x509Identity,
      ccp,
      contractName
    );

    return [ca, gateway, contract];
  } catch (error) {
    throw `[-] ConnectToFabric failed. Error: ${error}`;
  }
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
    // method to connect to fabric network
    [ca, gateway, contract] = await connectToFabric(
      hospitalID,
      x509Identity,
      contractName
    );
    let result = await contract.submitTransaction(method, parameters);
    console.log(`Transaction has been invoked`);
    await gateway.disconnect();
    if (!result.toString()) {
      result = true;
    }
    return JSON.parse(result.toString());
  } catch (error) {
    throw `[-] invoke transaction of ${userID} is failed Error: ${error}`;
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
    // method to connect to fabric network
    [ca, gateway, contract] = await connectToFabric(
      hospitalID,
      x509Identity,
      contractName
    );
    let result = await contract.evaluateTransaction(method, parameters);
    console.log(`Transaction has been evaluated`);
    await gateway.disconnect();

    return JSON.parse(result.toString());
  } catch (error) {
    throw `[-] query transaction of ${userID} is failed Error: ${error}`;
  }
}

function generateAuthToken(req, res) {
  const token = jwt.sign({ user: req.body }, "khfoajsdlobgweofnladminljlj", {
    expiresIn: "1h",
  });
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 100000),
    httpOnly: true,
  });
}

module.exports = {
  buildConnectionProfile,
  buildAdminObject,
  buildCAClient,
  connectAndGetContract,
  connectToFabric,
  getHospitalID,
  invokeTransaction,
  queryTransaction,
  generateAuthToken,
};

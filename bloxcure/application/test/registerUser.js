/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Wallets, Gateway } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "initial-network",
      "organizations",
      "peerOrganizations",
      "hospital1.example.com",
      "connection-hospital1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities["ca.hospital1.example.com"].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const walletm = await Wallets.newInMemoryWallet();
    console.log(`Wallet: ${walletm}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get("PID29");
    if (userIdentity) {
      console.log(
        'An identity for the user "PID29" already exists in the wallet'
      );
      return;
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin" does not exist in the wallet'
      );
      console.log("Run the enrollAdmin.js application before retrying");
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register the user, enroll the user, and import the new identity into the wallet.
    let firstName = "Fahad";
    let lastName = "bin raza";
    let role = "patient";
    let CNIC = "38302245347635";
    const secret = await ca.register(
      {
        affiliation: "org1.department1",
        enrollmentID: "PID29",
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
    const enrollment = await ca.enroll({
      enrollmentID: "PID29",
      enrollmentSecret: secret,
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
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "hospital1MSP",
      type: "X.509",
    };
    walletm.put("PID29", x509Identity);
    console.log(walletm.get("PID6"));

    // query part *******************************
    console.log("before gateway conectted");
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      walletm,
      identity: "PID29",
      discovery: { enabled: true, asLocalhost: true },
    });

    console.log("gateway conectted");

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("islamabadhospitalschannel");

    // Get the contract from the network.
    const contract = network.getContract("bloxcure", "PatientContract");

    // Evaluate the specified transaction.
    let result = await contract.evaluateTransaction("queryPatient");

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );

    // Disconnect from the gateway.
    await gateway.disconnect();

    // query part end **********************************
    console.log(
      'Successfully registered and enrolled admin user "PID29" and imported it into the wallet'
    );
  } catch (error) {
    console.error(`Failed to register user "PID29": ${error}`);
    process.exit(1);
  }
}

main();

/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Wallets } = require("fabric-network");
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
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get("PID1");
    if (userIdentity) {
      console.log(
        'An identity for the user "PID1" already exists in the wallet'
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
    const secret = await ca.register(
      {
        affiliation: "org1.department1",
        enrollmentID: "PID1",
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
            name: "role",
            value: role,
            ecert: true,
          },
        ],
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: "PID1",
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
    await wallet.put("PID1", x509Identity);
    console.log(
      'Successfully registered and enrolled admin user "PID1" and imported it into the wallet'
    );
  } catch (error) {
    console.error(`Failed to register user "PID1": ${error}`);
    process.exit(1);
  }
}

main();

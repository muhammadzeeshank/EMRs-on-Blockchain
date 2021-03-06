/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
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
      "hospital2.example.com",
      "connection-hospital2.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.hospital2.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the hospital2admin user.
    const identity = await wallet.get("hospital2admin");
    if (identity) {
      console.log(
        'An identity for the hospital2admin user "hospital2admin" already exists in the wallet'
      );
      return;
    }

    // Enroll the hospital2admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: "hospital2admin",
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "hospital2MSP",
      type: "X.509",
    };
    await wallet.put("hospital2admin", x509Identity);
    console.log(
      'Successfully enrolled hospital2admin user "hospital2admin" and imported it into the wallet'
    );
  } catch (error) {
    console.error(
      `Failed to enroll hospital2admin user "hospital2admin": ${error}`
    );
    process.exit(1);
  }
}

main();

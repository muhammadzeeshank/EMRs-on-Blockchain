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
      "hospital1.example.com",
      "connection-hospital1.json"
    );
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities["ca.hospital1.example.com"];
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

    // Check to see if we've already enrolled the hospital1admin user.
    const identity = await wallet.get("hospital1admin");
    if (identity) {
      console.log(
        'An identity for the hospital1admin user "hospital1admin" already exists in the wallet'
      );
      return;
    }

    // Enroll the hospital1admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({
      enrollmentID: "hospital1admin",
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "hospital1MSP",
      type: "X.509",
    };
    await wallet.put("hospital1admin", x509Identity);
    console.log(
      'Successfully enrolled hospital1admin user "hospital1admin" and imported it into the wallet'
    );
  } catch (error) {
    console.error(
      `Failed to enroll hospital1admin user "hospital1admin": ${error}`
    );
    process.exit(1);
  }
}

main();

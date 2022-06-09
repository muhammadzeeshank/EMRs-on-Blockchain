/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

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

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get("PID6");
    console.log(`Identity: ${identity}`);
    if (!identity) {
      console.log(
        'An identity for the user "PID6" does not exist in the wallet'
      );
      console.log("First enroll then try to get data");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "PID6",
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("islamabadhospitalschannel");

    // Get the contract from the network.
    const contract = network.getContract("bloxcure");

    // Evaluate the specified transaction.
    let result = await contract.evaluateTransaction("queryPatient", "PID0");

    console.log(
      `Transaction has been evaluated, result is: ${result.toString()}`
    );

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
}

main();

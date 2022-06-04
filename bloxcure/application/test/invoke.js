/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Gateway, Wallets } = require("fabric-network");
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
    let ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get("admin");
    if (!identity) {
      console.log(
        'An identity for the user "admin" does not exist in the wallet'
      );
      console.log("Run the registerUser.js application before retrying");
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin",
      discovery: { enabled: true, asLocalhost: true },
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("islamabadhospitalschannel");

    // Get the contract from the network.
    const contract = network.getContract("bloxcure", "AdminContract");

    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
    // await contract.submitTransaction(
    //   "createPatient",
    //   '{"patientID":"PID1","firstName":"Ahmad","lastName":"Munir","age":"21","phoneNumber":"+491764561111","address":"Mainzer landstrasse 134, 60326 Frankfurt am Main","bloodGroup":"B+","allergies":"No","symptoms":"Heart Burn, shortness of breath, Acidity","diagnosis":"Esophagitis","treatment":"omeprazole 40 mg for 10 days before food","followUp":"2 Weeks","permissionGranted":["hosp1admin","hosp2admin"],"password":"fd1e5d642da134218f1cc5c260feb3e4042658a35d78c4eb2fe2b2f1c7e7795b","pwdTemp":true}'
    // );
    await contract.submitTransaction(
      "createPatient",
      `{"patientID":"${userID}","CNIC":"${CNIC}","firstName":"${firstName}","lastName":"${lastName}","birthDate":"${birthDate}","phoneNumber":"${phoneNumber}",emergPhoneNumber:"${emergPhoneNumber}","address":"${address}","bloodGroup":"${bloodGroup}"}`
    );

    // await contract.submitTransaction("writeData", "PID10", "hi how are you");
    console.log("Transaction has been submitted");

    // Disconnect from the gateway.
    await gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction: ${error}`);
    process.exit(1);
  }
}

main();

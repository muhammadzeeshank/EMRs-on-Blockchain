#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"javascript"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

if [ "$CC_SRC_LANGUAGE" = "go" -o "$CC_SRC_LANGUAGE" = "golang" ] ; then
	CC_SRC_PATH="../chaincode/bloxcure/go/"
elif [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_SRC_PATH="../chaincode/bloxcure/"
elif [ "$CC_SRC_LANGUAGE" = "java" ]; then
	CC_SRC_PATH="../chaincode/bloxcure/java"
elif [ "$CC_SRC_LANGUAGE" = "typescript" ]; then
	CC_SRC_PATH="../chaincode/bloxcure/typescript/"
else
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, application, and typescript
	exit 1
fi

# clean out any old identites in the wallets
rm -rf application/wallet/*
rm -rf java/wallet/*
rm -rf typescript/wallet/*
rm -rf go/wallet/*

# launch network; create channel and join peer to channel
pushd ../initial-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn bloxcure -ccv 1 -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

Version -ccv: A version number or value associated with a given chaincodes package. 
If you upgrade the chaincode binaries, you need to change your chaincode version as well.

Sequence -ccs: The number of times the chaincode has been defined. This value is an integer, 
and is used to keep track of chaincode upgrades. For example, when you first install 
and approve a chaincode definition, the sequence number will be 1. When you next 
upgrade the chaincode, the sequence number will be incremented to 2.

Next, use the BloxCure application to interact with the deployed BloxCure contract.
use this command to upgrade smartcontract
./network.sh deployCC -ccn bloxcure -ccv 1.1 -ccs 1 -cci initLedger -ccl javascript -ccp ../chaincode/bloxcure/


EOF

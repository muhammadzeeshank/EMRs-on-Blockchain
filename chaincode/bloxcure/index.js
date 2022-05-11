/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const BloxCure = require("./lib/bloxcure");
const AdminContract = require("./lib/admin-contract");
// module.exports.BloxCure = BloxCure;
module.exports.contracts = [BloxCure, AdminContract];

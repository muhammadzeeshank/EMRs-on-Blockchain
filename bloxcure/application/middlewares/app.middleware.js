const jwt = require("jsonwebtoken");

function getHospitalID(x509Identity) {
  let mspid = x509Identity.mspId;
  let hospitalID = mspid.toString().match(/\d+/g)[0];
  return parseInt(hospitalID);
}
async function userAuthentication(req, res, next) {
  let userID = "";
  let x509Identity = "";
  let hospitalID;
  let decoded;
  try {
    // check if the request contains userID and x509Identity
    if (req.body.userID && req.body.x509Identity) {
      userID = req.body.userID;
      x509Identity = req.body.x509Identity;

      // check if the rquest contains hospitalID
      req.body.hospitalID
        ? (hospitalID = req.body.hospitalID)
        : (hospitalID = getHospitalID(x509Identity));
    } else if (req.body.secret && req.body.userID && req.body.hospitalID) {
      hospitalID = req.body.hospitalID;
      userID = req.body.userID;
    }

    // if not then check and verify jwt token
    else {
      const token = req.cookies.jwt;
      // console.log(`jwt is: ${token}`);
      decoded = jwt.verify(token, "khfoajsdlobgweofnladminljlj");
      userID = decoded.user.userID;
      x509Identity = decoded.user.x509Identity;
      // check if the token contains hospitalID
      // if not then calculate from x509Identity
      decoded.user.hospitalID
        ? (hospitalID = decoded.user.hospitalID)
        : (hospitalID = getHospitalID(x509Identity));
    }

    // console.log(`hospitalID : ${JSON.stringify(x509Identity)}`);
    // console.log(`hospitalID : ${JSON.stringify(adminID)}`);
    req.body.userID = userID;
    req.body.x509Identity = x509Identity;
    req.body.hospitalID = hospitalID;
    next();
  } catch (error) {
    res.status(401).send(`userAuthentication failed. Error: ${error}`);
  }
}
module.exports = {
  userAuthentication,
};

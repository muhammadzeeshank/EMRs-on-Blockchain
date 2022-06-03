let s0 =
  "x509::/OU=org1/OU=client/OU=department1/CN=PID233435::/C=US/ST=North Carolina/L=Durham/O=hospital1.example.com/CN=ca.hospital1.example.com";
let s1 =
  "x509::/OU=client/CN=admin::/C=US/ST=North Carolina/L=Durham/O=hospital1.example.com/CN=ca.hospital1.example.com";

function getClientId(clientIdentity = "") {
  let identity = clientIdentity.split("::")[1].split("::")[0];
  let index = identity.search("CN") + 3;
  return identity.slice(index);
  // returns undefined when no parameter
  // return clientIdentity.match(/CN=([a-z]|[A-Z])*([0-9]?)*/)?.[0]?.slice(3);
}
console.log(getClientId(s0));

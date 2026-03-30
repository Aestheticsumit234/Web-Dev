// how to hash
let userId = `6819191bbc9da1bf37aaed43`;
let expiry = Math.round(Date.now() / 1000) + 60 * 60 * 24;

// converting this into json
const payload = {
  userId,
  expiry,
};

// converting this into json
let jsonData = JSON.stringify(payload);

// converting this into base64
let base64 = Buffer.from(jsonData).toString("base64");

// let's verify this token
let decoded = Buffer.from(base64, "base64").toString("utf-8");

console.log(
  `UserId --> ${userId} \n Json Data --> ${jsonData} \n Base64 token payload --> ${base64}`,
);
console.log("decoded token payload -->: ", decoded);

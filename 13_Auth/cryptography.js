import crypto from "crypto";
import { createWriteStream } from "fs";
import { readFile } from "fs/promises";
// // cryptography is the art and science of securing and transforming into a fromat that can only be understood by the authorized person it ensure the confidentiality, integrity,authentication and non-repudiation of infromation

// // type of cryptography
// // 1 Encryption(reversiable)
// // 2 Hashing (unreversiable)

// // 1 Encryption

// const key = crypto.randomBytes(32).toString("hex");
// console.log(key);

// // hashing
// // how to hash any character and Data
// const Say = new TextEncoder().encode("Sumit");
// // console.log(Say);
// const hashBuffer = await crypto.subtle.digest("SHA-256", Say);
// const hashArray = Array.from(new Uint8Array(hashBuffer));
// const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
// console.log(hashHex);

// // using node how to create hash

// const hash = crypto.createHash("sha256").update("Sumit").digest("hex");
// console.log(hash);

const loanFile = await readFile("./Loan.Agreement.md", "utf-8");
const Loan_Signature = "sumit_sharma_sakshi_8683_2748";
const hash = crypto
  .createHash("sha256")
  .update(loanFile)
  .update(Loan_Signature)
  .digest("base64url");

const writeStream = createWriteStream("./Signed_Loan.Agreement.md");

writeStream.write(loanFile);
writeStream.end(hash);
console.log("created file");

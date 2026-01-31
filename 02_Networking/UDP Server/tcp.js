import dgram from "node:dgram";
import { readFile } from "node:fs/promises";

const socket = dgram.createSocket("udp4");

socket.on("message", (message, remoteAddress) => {
  console.log(message.toString());
  console.log(remoteAddress);

  readFile("./text2.txt", "utf8").then((data) => {
    socket.send(data, remoteAddress.port, remoteAddress.address);
  });
});
socket.bind({ port: 41234 }, () => {
  let address = socket.address();
  console.log("UDP server listening on port", address.port);
});

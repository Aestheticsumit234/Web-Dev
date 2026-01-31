import dgram from "node:dgram";
import { readFile } from "node:fs";

const socket = dgram.createSocket("udp4");

socket.on("message", (message, remoteAddress) => {
  console.log(message.toString());
  console.log(remoteAddress);
});

readFile("./text.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  socket.send(data, 41234, "localhost");
});

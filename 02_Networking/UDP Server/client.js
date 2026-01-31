import dgram from "node:dgram";

const socket = dgram.createSocket("udp4");

socket.on("message", (message, remoteAddress) => {
  console.log(message.toString());
  console.log(remoteAddress);
});

socket.send("let's have fun sumit", 41234, "localhost");

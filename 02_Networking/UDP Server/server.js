import dgram from "node:dgram";

const socket = dgram.createSocket("udp4");

socket.on("message", (message, remoteAddress) => {
  console.log(message.toString());
  console.log(remoteAddress);

  socket.send(
    "Let's this is my response",
    remoteAddress.port,
    remoteAddress.address
  );
});
socket.bind({ port: 41234 }, () => {
  let address = socket.address();
  console.log("UDP server listening on port", address.port);
});

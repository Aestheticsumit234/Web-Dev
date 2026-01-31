import net from "node:net";

const server = net.createServer();

server.listen(8080);

server.on("listening", () => {
  console.log("TCP server listening on port 8080");
});

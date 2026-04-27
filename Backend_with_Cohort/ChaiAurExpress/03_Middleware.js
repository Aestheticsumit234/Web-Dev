import express from "express";
function block_2_Server() {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    const server = app.listen(0, async () => {
      const port = server.address().port;
      const base = `http://127.0.0.1:${port}`;
    });
  });
}

async function main() {
  await block_2_Server();
}

main().catch(console.error);

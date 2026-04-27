import express from "express";
function block_2_Server() {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    // request logger ki Aao entery kro jao
    const log = [];

    app.use((res, req, next) => {
      let logEntery = `${req.method} : ${req.url}`;
      log.push(logEntery);
      console.log(`[LOG] : ${logEntery}`);

      // if hange froever that means if you forget to call next method in middleware
      next();
    });

    function authMe(res, req, next) {
      const token = req.headers["token"];

      if (!token) {
        return res.json({ message: "unuthroized user" });
      }

      if (token !== "secret-key") {
        return res.json({ message: "unuthroized user" });
      }

      req.user = { id: 1, name: "sumit", role: "software developer" };

      next();
    }

    function getRole(accessRoles) {
      return (req, res, next) => {
        if (!req.user) {
          return res.json({ error: "User not authenticated for this Action" });
        }

        let role = Array.isArray(accessRoles) ? accessRoles : [accessRoles];

        if (!role.includes(req.user.role)) {
          return res.json({ error: "User not authenticated for this Action" });
        }
        next();
      };
    }

    const controllerHere = () => {};
    app.get("/route", authMe, getRole("admin"), controllerHere);
    app.get("/route", authMe, getRole("user"), controllerHere);
    app.get("/route", authMe, getRole("superAdmin"), controllerHere);
    app.get("/route", authMe, getRole(["admin", "teacher"]), controllerHere);

    app.use((req, res, next) => {
      req.startTime = Data.now();

      res.on("finish", () => {
        const duration = Date.now() - req.startTime;
        console.log(
          `[Timer] : ${req.method} - ${req.url} its took ${duration}ms`,
        );
      });
      next();
    });

    const server = app.listen(0, async () => {
      const port = server.address().port;
      const base = `http://127.0.0.1:${port}`;

      try {
        const res = await fetch(`${base}/all`, {
          method: "GET",
        });
        const respose = await res.json();
        console.log(respose);
      } catch (error) {}
    });
  });
}

async function main() {
  await block_2_Server();
}

main().catch(console.error);

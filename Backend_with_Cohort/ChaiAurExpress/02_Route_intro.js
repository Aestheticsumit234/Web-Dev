import express from "express";

function block_2_Server() {
  return new Promise((resolve) => {
    try {
      const app = express();
      app.use(express.json());

      const routes = {
        1: {
          id: 1,
          trainName: "KathGodan Express",
          direction: "north",
        },
        2: {
          id: 2,
          trainName: "Litchvi Express",
          direction: "north",
        },
      };

      let nextid = 3;
      // get All train
      app.get("/trains", async (req, res) => {
        const Data = Object.values(routes);
        res.json(Data.map((trains) => trains.trainName));
      });
      // sdingle routes
      app.get("/trains/:id", async (req, res) => {
        const { id } = req.params;
        const route = routes[id];
        if (!route)
          return res
            .status(404)
            .json({ message: "Train not found on this Root" });
        res.status(201).json({
          route: route,
        });
      });
      // Add a train
      app.post("/create-route", (req, res) => {
        const { trainName, direction } = req.body;
        const newRoute = { id: nextid++, ...{ trainName, direction } };
        routes[newRoute.id] = newRoute;
        res.status(201).json({ routes });
      });
      // put delete task kal krna hai

      app.put("/train/:id", (req, res) => {
        const { trainName, direction } = req.body;
        let route = routes[req.params.id];
        route = { id: route.id, trainName, direction };
        routes[route.id] = route;
        return res.status(200).json({
          routes,
          message: "updated Sucessfully",
        });
      });
      app.patch("/train/:id", (req, res) => {
        const { trainName, direction } = req.body;
        let route = routes[req.params.id];
        route = { id: route.id, trainName, direction };
        routes[route.id] = route;
        res.status(202).json({
          routes,
          message: "updated Sucessfully",
        });
      });
      app.delete("/train/:id", (req, res) => {
        delete routes[req.params.id];
        res.status(200).json({
          routes,
          message: "updated Sucessfully",
        });
      });
      const server = app.listen(0, async () => {
        const port = server.address().port;
        const base = `http://127.0.0.1:${port}`;
        try {
          // TODO : yaha par fetch Krna hai sara data aana hai lekr
          const TrainRespose = await fetch(`${base}/trains`);
          const Trains = await TrainRespose.json();
          console.log(Trains);

          const createdTrain = await fetch(`${base}/create-route`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trainName: " SabarMati Express",
              direction: "west-east",
            }),
          });
          const trainDetails = await createdTrain.json();
          console.log(trainDetails.routes);

          const updateTrain = await fetch(`${base}/train/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trainName: " Sumit Express",
              direction: "north-south",
            }),
          });
          const updateTrainData = await updateTrain.json();
          console.log(updateTrainData);

          const updateSingleTrain = await fetch(`${base}/train/1`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              trainName: " Samastipur Express",
              direction: "north-south",
            }),
          });
          const updatedSingleTrain = await updateSingleTrain.json();
          console.log(updatedSingleTrain);

          const DeleteRoutes = await fetch(`${base}/train/1`, {
            method: "DELETE",
          });
          const DeletedRoute = await DeleteRoutes.json();
          console.log(DeletedRoute);
        } catch (error) {
          console.log(error);
        }

        server.close(() => {
          console.log("Server end..............");
          resolve();
        });
      });
    } catch (error) {
      console.log(error);
    }
  });
}

async function main() {
  // await block_1_Server()
  await block_2_Server();
  // process.exit(0)
}

main().catch(console.error);

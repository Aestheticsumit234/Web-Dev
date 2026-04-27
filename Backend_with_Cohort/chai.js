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

// const data = {
//     trainName : "Aman",
//     direction:"north-east"
// }

const id = 2;
delete routes[id];
// console.log("-->",route);
// let {trainName, direction} = data
// route = {id:route.id, trainName,direction}
// routes[route.id] = route
console.log(routes);

// let indexId = 3
// const data = Object.values(routes)
// const newData = {id: indexId++, ...{    trainName: "Litchvi Express", direction: "north"}}
// routes[newData.id] = newData
// console.log(routes)

const AccessFor = ["admin", "teacher"];

req.users.includes(AccessFor);

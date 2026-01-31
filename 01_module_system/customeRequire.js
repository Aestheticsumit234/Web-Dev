function myRequire(moduleName) {
  const fs = require("fs");
  const fileContent = fs.readFileSync(moduleName + ".js", "utf-8").toString();
  
}

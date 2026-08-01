import fs from "node:fs";
const route="src/app/api/v1/openapi/route.ts";
if(!fs.existsSync(route)) throw new Error("OpenAPI route missing");
console.log("OpenAPI route present");

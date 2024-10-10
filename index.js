#!/usr/bin/env node

import Service from "./src/Service.js";

const service = new Service();

if(process.argv[2] === "theme" || process.argv[2] === "plugin") {
    service.run(process.argv[2]);
} else {
    console.log("Available options are 'theme' or 'plugin'");
}

#!/usr/bin/env node

import ThemeService from "./src/ThemeService.js";
import PluginService from "./src/PluginService.js";

if (process.argv[2] && process.argv[2] === "theme") {
    const themeService = new ThemeService();
    themeService.run();
} else if (process.argv[2] && process.argv[2] === "plugin") {
    const pluginService = new PluginService();
    pluginService.run();
} else {
    console.log("Available options are 'theme' or 'plugin'");
}



#!/usr/bin/env node
import ThemeService from "./src/services/ThemeService.js";

if(process.argv[2] === "theme") {
    const themeService = new ThemeService();
    themeService.run();
}
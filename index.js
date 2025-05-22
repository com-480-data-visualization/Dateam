"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const loadStadiums_1 = require("./scripts/loadStadiums");
const constants_1 = require("./scripts/constants");
const year_selector_1 = require("./scripts/year-selector");
// The sidebar is now initialized in map.ts
require("./scripts/map");
// Initialize year selector service
const yearSelectorService = new year_selector_1.YearSelectorService();
yearSelectorService.init();
console.log(yearSelectorService.currentYearPeriod);
// Main entry point for loading stadium data
function initializeStadiums() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Stadium loading started");
        try {
            // Load stadiums from CSV
            const loadedStadiums = yield (0, loadStadiums_1.loadStadiums)();
            // Update the stadiums array in constants.ts
            if (loadedStadiums && loadedStadiums.length > 0) {
                console.log(`✅ Successfully loaded ${loadedStadiums.length} stadiums`);
                // Clear and update the stadiums array
                constants_1.stadiums.length = 0;
                loadedStadiums.forEach(stadium => constants_1.stadiums.push(stadium));
                // Dispatch an event to notify the map that stadiums are loaded
                const event = new CustomEvent('stadiumsLoaded', { detail: { count: constants_1.stadiums.length } });
                document.dispatchEvent(event);
            }
            else {
                console.warn("⚠️ No stadiums loaded, using fallback data");
                constants_1.stadiums.length = 0;
                constants_1.fallbackStadiums.forEach(stadium => constants_1.stadiums.push(stadium));
                // Dispatch an event for fallback stadiums
                const event = new CustomEvent('stadiumsLoaded', { detail: { count: constants_1.stadiums.length, fallback: true } });
                document.dispatchEvent(event);
            }
        }
        catch (error) {
            console.error("❌ Error loading stadium data:", error);
            console.log("⚠️ Using fallback stadium data");
            // Clear and update with fallbacks
            constants_1.stadiums.length = 0;
            constants_1.fallbackStadiums.forEach(stadium => constants_1.stadiums.push(stadium));
            // Dispatch an event for fallback stadiums
            const event = new CustomEvent('stadiumsLoaded', { detail: { count: constants_1.stadiums.length, fallback: true } });
            document.dispatchEvent(event);
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    // Initialize stadium data with a slight delay to ensure the map is ready
    setTimeout(() => {
        initializeStadiums();
    }, 100);
});

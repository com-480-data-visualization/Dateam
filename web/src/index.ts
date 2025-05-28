import * as d3 from 'd3'
import { stadiums, fallbackStadiums } from './scripts/constants';
import { YearSelectorService } from './scripts/year-selector';
// The sidebar is now initialized in map.ts
import './scripts/map';

// Initialize year selector service
const yearSelectorService = new YearSelectorService();
yearSelectorService.init();

console.log(yearSelectorService.currentYearPeriod);

// Main entry point for loading stadium data
async function initializeStadiums() {
  console.log("🚀 Stadium loading started");

  const event = new CustomEvent('stadiumsLoaded', { detail: { count: stadiums.length } });
  document.dispatchEvent(event);
    
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize stadium data with a slight delay to ensure the map is ready
  setTimeout(() => {
    initializeStadiums();
  }, 100);
});
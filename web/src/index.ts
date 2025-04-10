import * as d3 from 'd3'
import { loadStadiums } from './scripts/loadStadiums';
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
  
  try {
    // Load stadiums from CSV
    const loadedStadiums = await loadStadiums();
    
    // Update the stadiums array in constants.ts
    if (loadedStadiums && loadedStadiums.length > 0) {
      console.log(`✅ Successfully loaded ${loadedStadiums.length} stadiums`);
      
      // Clear and update the stadiums array
      stadiums.length = 0;
      loadedStadiums.forEach(stadium => stadiums.push(stadium));
      
      // Dispatch an event to notify the map that stadiums are loaded
      const event = new CustomEvent('stadiumsLoaded', { detail: { count: stadiums.length } });
      document.dispatchEvent(event);
    } else {
      console.warn("⚠️ No stadiums loaded, using fallback data");
      stadiums.length = 0;
      fallbackStadiums.forEach(stadium => stadiums.push(stadium));
      
      // Dispatch an event for fallback stadiums
      const event = new CustomEvent('stadiumsLoaded', { detail: { count: stadiums.length, fallback: true } });
      document.dispatchEvent(event);
    }
  } catch (error) {
    console.error("❌ Error loading stadium data:", error);
    console.log("⚠️ Using fallback stadium data");
    
    // Clear and update with fallbacks
    stadiums.length = 0;
    fallbackStadiums.forEach(stadium => stadiums.push(stadium));
    
    // Dispatch an event for fallback stadiums
    const event = new CustomEvent('stadiumsLoaded', { detail: { count: stadiums.length, fallback: true } });
    document.dispatchEvent(event);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize stadium data with a slight delay to ensure the map is ready
  setTimeout(() => {
    initializeStadiums();
  }, 100);
});
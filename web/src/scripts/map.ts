console.log("📍 map.ts loaded");

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stadiums } from './constants';
import { YEARS } from './constants';

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM ready");

  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error("❌ #map element not found");
    return;
  }

  console.log("🗺️ Initializing map...");

  // Center the map on Europe
  const map = L.map('map').setView([48.8566, 2.3522], 4);

  // Add tile layer (map background)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  console.log("✅ Map initialized");
  
  // Store markers for potential filtering later
  const teamMarkers: { [teamName: string]: L.Marker } = {};
  
  // Add markers function - will be called once stadiums are loaded
  function addMarkers() {
    if (stadiums.length === 0) {
      console.warn("⚠️ No stadium data available for markers");
      return;
    }
    
    console.log(`🏟️ Adding ${stadiums.length} stadium markers...`);
    
    // Create markers for each stadium
    stadiums.forEach((team, index) => {
      try {
        // Create custom icon with team logo
        const icon = L.icon({
          iconUrl: team.logo,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
          className: 'team-logo-marker'
        });

        // Add marker with popup
        const marker = L.marker(team.coords, { icon }).addTo(map);
        marker.bindPopup(`<div class="team-popup"><b>${team.name}</b></div>`);
        
        // Store marker reference for later
        teamMarkers[team.name] = marker;
        
        // Log every 20th marker added (to avoid console spam)
        if (index % 20 === 0 || index === stadiums.length - 1) {
          console.log(`✅ Added marker ${index + 1}/${stadiums.length}: ${team.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding marker for ${team.name}:`, error);
      }
    });
    
    // Fit map bounds to include all markers
    if (stadiums.length > 0) {
      const bounds = L.latLngBounds(stadiums.map(stadium => stadium.coords));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    console.log("✅ All team markers added");
  }
  
  // Listen for year changes if needed
  document.addEventListener('yearChanged', (event: CustomEvent) => {
    const selectedYear = event.detail.year;
    console.log(`Year changed to ${selectedYear}, updating map...`);
    
    // Here you could filter teams based on the selected year
    // This is just a placeholder - implement actual filtering logic
    // based on your data structure and requirements
  });
  
  // Add observers to detect when stadiums are loaded
  let checkTimer = null;
  const checkStadiums = () => {
    if (stadiums.length > 0) {
      clearInterval(checkTimer);
      addMarkers();
    }
  };
  
  // Check for stadiums every 100ms for up to 10 seconds
  checkTimer = setInterval(checkStadiums, 100);
  setTimeout(() => {
    clearInterval(checkTimer);
    if (stadiums.length === 0) {
      console.error("❌ Timeout waiting for stadium data");
    }
  }, 10000);
});
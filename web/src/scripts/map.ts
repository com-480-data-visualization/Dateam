console.log("📍 map.ts loaded");

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stadiums } from './constants';
import { YEARS } from './constants';

// Interface for extended team data
interface ExtendedTeamData {
  // CSV fields
  team_api_id?: number;
  team_fifa_api_id?: number;
  team_short_name?: string;
  transfers_name?: string;
  country?: string;
  league?: string;
  
  // Other fields
  name: string;
  coords: [number, number];
  logo: string;
}

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

  // Add tile layer (map background) - Using a CDN that works well with localhost
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  console.log("✅ Map initialized");
  
  // Store markers for potential filtering later
  const teamMarkers: { [teamName: string]: L.Marker } = {};
  
  // Team info panel elements
  const infoPanel = document.getElementById('team-info-panel');
  const closeButton = document.getElementById('close-info-panel');
  const teamLogo = document.getElementById('team-logo') as HTMLImageElement;
  const teamName = document.getElementById('team-name');
  const teamCountry = document.getElementById('team-country')?.querySelector('span');
  const teamLeague = document.getElementById('team-league')?.querySelector('span');
  const teamApiId = document.getElementById('team-api-id')?.querySelector('span');
  const stadiumCoordinates = document.getElementById('stadium-coordinates')?.querySelector('span');
  const teamShortName = document.getElementById('team-short-name')?.querySelector('span');
  const teamFifaId = document.getElementById('team-fifa-id')?.querySelector('span');
  const teamTransfersName = document.getElementById('team-transfers-name')?.querySelector('span');
  
  // Mini map for stadium location
  let miniMap: L.Map | null = null;
  
  // Initialize info panel functionality
  if (infoPanel && closeButton) {
    // Close button functionality
    closeButton.addEventListener('click', () => {
      infoPanel.classList.remove('open');
      
      // If mini map exists, remove it to free resources
      if (miniMap) {
        miniMap.remove();
        miniMap = null;
      }
    });
    
    // Make sure panel is initially closed
    infoPanel.classList.remove('open');
  } else {
    console.error("❌ Info panel elements not found");
  }
  
  // Function to open team info panel
  function openTeamInfoPanel(team: ExtendedTeamData) {
    if (!infoPanel) return;
    
    console.log("Opening info panel for:", team);
    
    // Update panel content with available data
    if (teamLogo) {
      teamLogo.src = team.logo;
      // Add error handler for logo loading - use fallback if image fails to load
      teamLogo.onerror = () => {
        console.warn(`Failed to load logo for ${team.name}, using fallback`);
        teamLogo.src = '/assets/placeholder-logo.png'; // You may need to create this file
      };
    }
    
    if (teamName) teamName.textContent = team.name;
    
    // Update team info if available
    if (teamCountry) teamCountry.textContent = team.country || 'N/A';
    if (teamLeague) teamLeague.textContent = team.league || 'N/A';
    if (teamApiId) teamApiId.textContent = team.team_api_id?.toString() || 'N/A';
    
    // Update stadium coordinates
    if (stadiumCoordinates) {
      stadiumCoordinates.textContent = `${team.coords[0].toFixed(4)}, ${team.coords[1].toFixed(4)}`;
    }
    
    // Update team identifiers
    if (teamShortName) teamShortName.textContent = team.team_short_name || 'N/A';
    if (teamFifaId) teamFifaId.textContent = team.team_fifa_api_id?.toString() || 'N/A';
    if (teamTransfersName) teamTransfersName.textContent = team.transfers_name || 'N/A';
    
    // Open the panel first before initializing mini-map
    infoPanel.classList.add('open');
    
    // Initialize or update mini map with a slight delay to ensure container is visible
    setTimeout(() => {
      const miniMapElement = document.getElementById('mini-map');
      if (miniMapElement) {
        // If mini map exists, remove it first
        if (miniMap) {
          miniMap.remove();
        }
        
        // Create mini map
        miniMap = L.map('mini-map', {
          attributionControl: false, // Remove attribution for cleaner look
          zoomControl: false // Remove zoom controls to save space
        }).setView(team.coords, 13);
        
        // Add tile layer to mini map - using the same style as main map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(miniMap);
        
        // Add marker to mini map
        L.marker(team.coords).addTo(miniMap);
        
        // Disable interactions on mini map
        miniMap.dragging.disable();
        miniMap.touchZoom.disable();
        miniMap.doubleClickZoom.disable();
        miniMap.scrollWheelZoom.disable();
        miniMap.boxZoom.disable();
        miniMap.keyboard.disable();
      }
    }, 300); // Delay to ensure the panel is visible
  }
  
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

        // Add marker with popup that includes a "View Details" button
        const marker = L.marker(team.coords, { icon }).addTo(map);
        marker.bindPopup(`
          <div class="team-popup">
            <b>${team.name}</b>
            <br>
            <button class="btn btn-sm btn-primary mt-2 view-team-details">View Details</button>
          </div>
        `);
        
        // Store team data with the marker for access when clicked
        const extendedTeam: ExtendedTeamData = {
          ...team,
          // Add placeholder data
          team_api_id: Math.floor(10000 + Math.random() * 90000), // Random ID
          team_fifa_api_id: Math.floor(100000 + Math.random() * 900000), // Random FIFA ID
          team_short_name: team.name.split(' ')[0], // First word of name as short name
          transfers_name: team.name, // Same as name for now
          country: getCountryFromCoords(team.coords), // Placeholder function
          league: getLeagueFromCountry(getCountryFromCoords(team.coords)) // Placeholder function
        };
        
        // Add event listener to popup for the "View Details" button
        marker.on('popupopen', () => {
          setTimeout(() => { // Small delay to ensure DOM is updated
            const button = document.querySelector('.view-team-details');
            if (button) {
              // Remove any existing listeners to prevent duplicates
              const newButton = button.cloneNode(true);
              if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
              }
              
              // Add new click listener
              newButton.addEventListener('click', () => {
                openTeamInfoPanel(extendedTeam);
                marker.closePopup();
              });
            }
          }, 50);
        });
        
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
  
  // Helper function to get country from coordinates (placeholder)
  function getCountryFromCoords(coords: [number, number]): string {
    // This is a very simplified approach using coordinate ranges
    // In a real application, you would use a GeoIP service or reverse geocoding
    const [lat, lng] = coords;
    
    // Some rough country estimations
    if (lat > 50 && lng < 0) return "United Kingdom";
    if (lat > 40 && lat < 45 && lng > 0 && lng < 10) return "Italy";
    if (lat > 40 && lng > -10 && lng < 5) return "Spain";
    if (lat > 45 && lng > 0 && lng < 15) return "Germany";
    if (lat > 45 && lng > 15) return "Eastern Europe";
    if (lat > 40 && lat < 45 && lng > 10) return "Balkans";
    if (lat > 45 && lng < 0) return "France";
    
    return "Europe"; // Default fallback
  }
  
  // Helper function to get league from country (placeholder)
  function getLeagueFromCountry(country: string): string {
    const leagueMap: { [country: string]: string } = {
      "United Kingdom": "Premier League",
      "Spain": "La Liga",
      "Italy": "Serie A",
      "Germany": "Bundesliga",
      "France": "Ligue 1",
      "Eastern Europe": "Various Leagues",
      "Balkans": "Various Leagues",
      "Europe": "European League"
    };
    
    return leagueMap[country] || "Unknown League";
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
  let checkTimer: number | null = null;
  const checkStadiums = () => {
    if (stadiums.length > 0) {
      if (checkTimer !== null) {
        clearInterval(checkTimer);
      }
      addMarkers();
    }
  };
  
  // Check for stadiums every 100ms for up to 10 seconds
  checkTimer = window.setInterval(checkStadiums, 100);
  setTimeout(() => {
    if (checkTimer !== null) {
      clearInterval(checkTimer);
    }
    if (stadiums.length === 0) {
      console.error("❌ Timeout waiting for stadium data");
    }
  }, 10000);
});
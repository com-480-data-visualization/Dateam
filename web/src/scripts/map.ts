console.log("📍 map.ts loaded");

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stadiums } from './constants';
import { YEARS } from './constants';
import { ScrollSidebar } from './sidebar';

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

// Map of teams with extended data
const extendedTeams: { [teamName: string]: ExtendedTeamData } = {};

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
  const exitButton = document.getElementById('exit-button');
  const teamLogo = document.getElementById('team-logo') as HTMLImageElement;
  const teamName = document.getElementById('team-name');
  const teamCountry = document.getElementById('team-country')?.querySelector('span');
  const teamLeague = document.getElementById('team-league')?.querySelector('span');
  const teamApiId = document.getElementById('team-api-id')?.querySelector('span');
  const stadiumCoordinates = document.getElementById('stadium-coordinates')?.querySelector('span');
  const teamShortName = document.getElementById('team-short-name')?.querySelector('span');
  const teamFifaId = document.getElementById('team-fifa-id')?.querySelector('span');
  const teamTransfersName = document.getElementById('team-transfers-name')?.querySelector('span');
  
  // Initialize sidebar
  let sidebar: ScrollSidebar | null = null;
  
  // Track current active team in sidebar
  let activeTeamElement: HTMLElement | null = null;
  
  // Mini map for stadium location
  let miniMap: L.Map | null = null;
  
  // Function to close the info panel
  function closeInfoPanel() {
    if (!infoPanel) return;
    
    infoPanel.classList.remove('open');
    
    // If mini map exists, remove it to free resources
    if (miniMap) {
      miniMap.remove();
      miniMap = null;
    }
    
    // Remove active state from sidebar team
    if (activeTeamElement) {
      activeTeamElement.classList.remove('active');
      activeTeamElement = null;
    }
    
    // Recenter the map to original view
    map.setView([48.8566, 2.3522], 4);
    
    console.log("Info panel closed");
  }
  
  // Initialize info panel functionality
  if (infoPanel) {
    // Close button functionality
    if (closeButton) {
      closeButton.addEventListener('click', closeInfoPanel);
    } else {
      console.warn("⚠️ Close button for info panel not found");
    }
    
    // Exit button should also close the info panel
    if (exitButton) {
      exitButton.addEventListener('click', () => {
        // First close the info panel if it's open
        if (infoPanel.classList.contains('open')) {
          closeInfoPanel();
        }
      });
    } else {
      console.warn("⚠️ Exit button not found");
    }
    
    // Make sure panel is initially closed
    infoPanel.classList.remove('open');
  } else {
    console.error("❌ Info panel elements not found");
  }
  
  // Function to center map with offset for the info panel
  function centerMapWithOffset(coords: [number, number], zoom: number) {
    // Calculate the center point taking into account the info panel
    // which takes up 50% of the right side
    
    // Get current map size
    const mapSize = map.getSize();
    
    // Create a point with 25% leftward offset (half of the 50% panel width)
    const offsetPoint = new L.Point(
      +mapSize.x * 0.2, // 25% leftward offset
      0  // No vertical offset
    );
    
    // Convert the target coordinates to a pixel point
    const latLng = L.latLng(coords[0], coords[1]);
    
    // Get the pixel coordinates for the target point
    const targetPoint = map.project(latLng, zoom);
    
    // Apply the offset to the target point
    const offsetTargetPoint = targetPoint.add(offsetPoint);
    
    // Convert back to geographical coordinates
    const offsetLatLng = map.unproject(offsetTargetPoint, zoom);
    
    // Fly to the offset coordinates
    map.flyTo(offsetLatLng, zoom, {
      duration: 1.5 // Animation duration in seconds
    });
  }
  
  // Function to open team info panel
  function openTeamInfoPanel(team: ExtendedTeamData, clickedElement?: HTMLElement) {
    if (!infoPanel) return;
    
    console.log("Opening info panel for:", team);
    
    // Update active state in sidebar
    if (activeTeamElement) {
      activeTeamElement.classList.remove('active');
    }
    
    // Use the sidebar element for this team if provided, or find it
    if (!clickedElement && team.name) {
      clickedElement = document.querySelector(`[title="${team.name}"]`) as HTMLElement;
    }
    
    activeTeamElement = clickedElement || null;
    if (activeTeamElement) {
      activeTeamElement.classList.add('active');
    }
    
    // Update panel content with available data
    if (teamLogo) {
      teamLogo.src = team.logo;
      // Add error handler for logo loading - use fallback if image fails to load
      teamLogo.onerror = () => {
        console.warn(`Failed to load logo for ${team.name}, using fallback`);
        teamLogo.src = './assets/placeholder-logo.svg';
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
    
    // Center map with offset, so the marker doesn't get hidden behind the info panel
    centerMapWithOffset(team.coords, 10);
    
    // Open the marker popup if it exists
    const marker = teamMarkers[team.name];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 1500); // Delay to match the flyTo animation
    }
  }
  
  // Handle sidebar team click
  function handleSidebarTeamClick(team: ExtendedTeamData, clickedElement: HTMLElement) {
    // If the info panel is already open for this team, close it
    if (activeTeamElement === clickedElement && infoPanel?.classList.contains('open')) {
      closeInfoPanel();
    } else {
      // Otherwise, open for the clicked team
      openTeamInfoPanel(team, clickedElement);
    }
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
        
        // Store extended team data
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
        
        // Store extended team data
        extendedTeams[team.name] = extendedTeam;
        
        // Create popup content with button
        const popupContent = L.DomUtil.create('div', 'team-popup');
        const teamTitle = L.DomUtil.create('b', '', popupContent);
        teamTitle.textContent = team.name;
        
        // Add line break
        popupContent.appendChild(document.createElement('br'));
        
        // Create button
        const viewDetailsBtn = L.DomUtil.create('button', 'btn btn-sm btn-primary mt-2', popupContent);
        viewDetailsBtn.textContent = 'View Details';
        viewDetailsBtn.style.marginTop = '5px';
        
        // Add click handler directly to the button
        L.DomEvent.on(viewDetailsBtn, 'click', (e) => {
          // Find the corresponding sidebar element
          const sidebarTeam = document.querySelector(`[title="${team.name}"]`) as HTMLElement;
          openTeamInfoPanel(extendedTeam, sidebarTeam);
          marker.closePopup();
          
          // Prevent event from propagating to map
          L.DomEvent.stopPropagation(e);
        });
        
        // Bind popup with our custom content
        marker.bindPopup(popupContent);
        
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
    
    // Initialize sidebar with teams after all markers are added
    initSidebar();
    
    // Fit map bounds to include all markers
    if (stadiums.length > 0) {
      const bounds = L.latLngBounds(stadiums.map(stadium => stadium.coords));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    console.log("✅ All team markers added");
  }
  
  // Initialize sidebar with teams
  function initSidebar() {
    const sidebarElement = document.getElementById('sidebar-scroll');
    if (!sidebarElement) {
      console.error("❌ Sidebar element not found");
      return;
    }
    
    sidebar = new ScrollSidebar('sidebar-scroll');
    
    // Initialize sidebar with teams
    sidebar.initWithTeams(stadiums, (team) => {
      // This is called when a team is clicked in the sidebar
      const extendedTeam = extendedTeams[team.name];
      if (extendedTeam) {
        // Get the sidebar element for this team
        const clickedElement = document.querySelector(`[title="${team.name}"]`) as HTMLElement;
        if (clickedElement) {
          handleSidebarTeamClick(extendedTeam, clickedElement);
        }
      }
    });
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
  
  // Listen for stadiums loaded event
  document.addEventListener('stadiumsLoaded', (event: CustomEvent) => {
    console.log("📣 Stadiums loaded event received");
    addMarkers();
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
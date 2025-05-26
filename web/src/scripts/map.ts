console.log("📍 map.ts loaded");

import L, { extend, Polyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { stadiums, Transfer, transfers } from './constants';
import { YEARS } from './constants';
import { ScrollSidebar } from './sidebar';
import * as d3 from "d3";
import data from '../assets/data/team_stats.json';
import transfersData from '../assets/data/clean_transfers.json';


let currentYearRange: [number, number] = [2008, 2015];

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
  let transferLines: Polyline[] = [];

  function drawTransfers(yearPeriod: number[], all_transfers: Transfer[]) {
    const fee2Weight = (fee: number): number => {
      if (fee > 1e8) {
        return 20;
      }
      if (fee > 1e7) {
        return 10;
      }
      if (fee > 1e6) {
        return 7;
      }
      if (fee > 1e4) {
        return 3;
      }
      return 1;
    }
    transferLines.forEach(l => l.removeFrom(map));
    transferLines = [];
    all_transfers.forEach((transfer: Transfer) => {
      const latlon_from = transfer.latlon_from, latlon_to = transfer.latlon_to;
      if (Number.parseInt(transfer.season.split("-")[0]) < yearPeriod[0] || Number.parseInt(transfer.season.split("-")[0]) > yearPeriod[1]) {
        return;
      }
      if (!!latlon_from[0] && !!latlon_from[1] && !!latlon_to[0] && !!latlon_to[1]) {
        const line = new L.Polyline([
          new L.LatLng(latlon_from[0], latlon_from[1]),
          new L.LatLng(latlon_to[0], latlon_to[1])],
          { color: 'red', weight: fee2Weight(transfer.transfer_fee || 0), opacity: 0.5, smoothFactor: 1 });
        transferLines.push(line);
        line.addTo(map);
      }
    });
  }

  document.addEventListener("yearSelectorChanged", (e: CustomEvent) => {
    currentYearRange = e.detail.newYears;
    drawTransfers(e.detail.newYears, transfers);
    const teamName = document.getElementById('team-name')?.textContent;
    if (teamName) {
      drawTeamWinsChart(teamName);
      drawTeamSpendingChart(teamName); 
    }
  });


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

    // Complete minimap section for openTeamInfoPanel function
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

        // Create custom icon with team logo for minimap (smaller than main map)
        const miniIcon = L.icon({
          iconUrl: team.logo,
          iconSize: [30, 30],  // Smaller than main map markers (which are 40x40)
          iconAnchor: [15, 15], // Center the icon
          popupAnchor: [0, -15], // Position popup above the icon
          className: 'team-logo-marker mini-marker'
        });

        // Add marker with team logo to mini map
        const miniMarker = L.marker(team.coords, { icon: miniIcon }).addTo(miniMap);
        
        // Add error handling for logo loading on minimap
        const img = new Image();
        img.onload = () => {
          console.log(`✅ Minimap logo loaded for ${team.name}`);
        };
        img.onerror = () => {
          console.warn(`⚠️ Failed to load minimap logo for ${team.name}, using fallback`);
          // Create fallback icon with placeholder - use consistent path
          const fallbackIcon = L.icon({
            iconUrl: './assets/placeholder-logo-svg.svg', // Match your HTML placeholder path
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            className: 'team-logo-marker mini-marker fallback'
          });
          miniMarker.setIcon(fallbackIcon);
        };
        img.src = team.logo;

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
    // drawTeamWinsChart(team.name);
    // drawTeamSpendingChart(team.name);
    setTimeout(() => {
    drawTeamWinsChart(team.name);
    drawTeamSpendingChart(team.name);
  }, 500);

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

        const matchedTeam = data.find(
          (d: any) => d.team === team.name || d.transfers_name === team.name
        );

        // Store extended team data
        const extendedTeam: ExtendedTeamData = {
          ...team,
          // Add placeholder data
          team_api_id: Math.floor(10000 + Math.random() * 90000), // Random ID
          team_fifa_api_id: Math.floor(100000 + Math.random() * 900000), // Random FIFA ID
          team_short_name: team.name.split(' ')[0], // First word of name as short name
          transfers_name: team.transfers_name,
          country: matchedTeam?.country || getCountryFromCoords(team.coords), // Placeholder function
          league: matchedTeam?.league || getLeagueFromCountry(matchedTeam?.country || getCountryFromCoords(team.coords)) // Placeholder function
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

        // Draw the transfers on click
        marker.on("click", () => {
          drawTransfers(currentYearRange, transfers.filter(transfer => transfer.team_from == extendedTeam.transfers_name || transfer.team_to == extendedTeam.transfers_name))
        });
        marker.getPopup().on("remove", () => transferLines.forEach(l => l.remove()));

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

  function initSidebar() {
    const sidebarElement = document.getElementById('sidebar-team-list');
    if (!sidebarElement) {
      console.error("❌ Sidebar team list element not found");
      return;
    }
  
    sidebar = new ScrollSidebar('sidebar-team-list');
    sidebar.initWithTeams(stadiums, (team) => {
      const extendedTeam = extendedTeams[team.name];
      if (extendedTeam) {
        const clickedElement = document.querySelector(`[title="${team.name}"]`) as HTMLElement;
        if (clickedElement) {
          handleSidebarTeamClick(extendedTeam, clickedElement);
        }
      }
    });
  
    // 🧠 Add search filtering logic
    const searchInput = document.getElementById('team-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const teamItems = document.querySelectorAll<HTMLElement>('#sidebar-team-list .sidebar-team-item');
        teamItems.forEach(item => {
          const title = item.getAttribute('title')?.toLowerCase() || '';
          item.style.display = title.includes(query) ? '' : 'none';
        });
      });
    }
  }

  const searchInput = document.getElementById("team-search") as HTMLInputElement;
searchInput?.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const teamItems = document.querySelectorAll(".sidebar-team-item");

  teamItems.forEach((item) => {
    const title = item.getAttribute("title")?.toLowerCase() || "";
    (item as HTMLElement).style.display = title.includes(query) ? "block" : "none";
  });
});
  
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







async function drawTeamWinsChart(teamName: string) {
  console.log("📊 Starting chart draw for team:", teamName);

  const chartContainer = document.getElementById("wins-chart");
  if (!chartContainer) {
    console.warn("❌ Chart container element #wins-chart not found.");
    return;
  }

  chartContainer.innerHTML = ""; // Clear previous chart

  try {
    if (!Array.isArray(data)) {
      console.error("❌ team_stats.json did not return an array.");
      return;
    }
    console.log("🔍 Comparing team names:");
    console.log("Team from UI:", teamName);


    const filtered = data.filter(
      (d: any) =>
        (d.team === teamName || d.transfers_name === teamName) &&
        parseInt(d.season.split("-")[0]) >= currentYearRange[0] &&
        parseInt(d.season.split("-")[0]) <= currentYearRange[1]
    );

    if (filtered.length === 0) {
      chartContainer.innerHTML = `<p class="text-muted">No data found for "${teamName}".</p>`;
      return;
    }

    const teamData = filtered.map((d: any) => ({
      season: d.season,
      total_wins: +d.wins_home + +d.wins_away,
      total_defeats: +d.losses_home + +d.losses_away,
      total_draws: +d.ties_home + +d.ties_away,

    }));

    teamData.sort((a, b) => d3.ascending(a.season, b.season));

    // const width = 450;
    const containerWidth = chartContainer.clientWidth || 550;
    const width = containerWidth;
    const height = 320;
    const margin = { top: 20, right: 30, bottom: 70, left: 50 };

    const svg = d3.select(chartContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scalePoint()
      .domain(teamData.map(d => d.season))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(teamData, d => Math.max(d.total_wins, d.total_defeats)) || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineWins = d3.line<any>()
      .x(d => x(d.season)!)
      .y(d => y(d.total_wins))
      .curve(d3.curveMonotoneX);

    const lineDefeats = d3.line<any>()
      .x(d => x(d.season)!)
      .y(d => y(d.total_defeats))
      .curve(d3.curveMonotoneX);

    const lineDraws = d3.line<any>()
      .x(d => x(d.season)!)
      .y(d => y(d.total_draws))
      .curve(d3.curveMonotoneX);

    const showWins = (document.getElementById("toggle-wins") as HTMLInputElement)?.checked;
    const showDefeats = (document.getElementById("toggle-defeats") as HTMLInputElement)?.checked;
    const showDraws = (document.getElementById("toggle-draws") as HTMLInputElement)?.checked;

  if (!showWins && !showDefeats && !showDraws) {
    chartContainer.innerHTML = `<p class="text-muted">Select at least one option to display data.</p>`;
    return;
  }

if (showWins) {
  svg.selectAll(".dot-win")
    .data(teamData)
    .enter()
    .append("circle")
    .attr("class", "dot-win")
    .attr("cx", d => x(d.season)!)
    .attr("cy", d => y(d.total_wins))
    .attr("r", 4)
    .attr("fill", "#198754");

  svg.append("path")
    .datum(teamData)
    .attr("fill", "none")
    .attr("stroke", "#198754")
    .attr("stroke-width", 2)
    .attr("d", lineWins);
}

if (showDefeats) {
  svg.selectAll(".dot-defeat")
    .data(teamData)
    .enter()
    .append("circle")
    .attr("class", "dot-defeat")
    .attr("cx", d => x(d.season)!)
    .attr("cy", d => y(d.total_defeats))
    .attr("r", 4)
    .attr("fill", "#dc3545");

  svg.append("path")
    .datum(teamData)
    .attr("fill", "none")
    .attr("stroke", "#dc3545")
    .attr("stroke-width", 2)
    .attr("d", lineDefeats);
}

if (showDraws) {
  svg.selectAll(".dot-draw")
    .data(teamData)
    .enter()
    .append("circle")
    .attr("class", "dot-draw")
    .attr("cx", d => x(d.season)!)
    .attr("cy", d => y(d.total_draws))
    .attr("r", 4)
    .attr("fill", "#0d6efd");

  svg.append("path")
    .datum(teamData)
    .attr("fill", "none")
    .attr("stroke", "#0d6efd")
    .attr("stroke-width", 2)
    .attr("d", lineDraws);
}


    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Axis labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height)
      .text("Season");

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(15,${height / 2})rotate(-90)`)
      .text("Number of Matches");

    // Add legend
    const legendData = [
      showWins ? { label: "Total Wins", color: "#198754" } : null,
      showDefeats ? { label: "Total Defeats", color: "#dc3545" } : null,
      showDraws ? { label: "Total Draws", color: "#0d6efd" } : null
    ].filter(Boolean);


    svg.selectAll(".legend")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cx", width - 100)
      .attr("cy", (_, i) => 20 + i * 20)
      .attr("r", 6)
      .style("fill", d => d.color);

    svg.selectAll(".legend-label")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", width - 90)
      .attr("y", (_, i) => 20 + i * 20 + 4)
      .text(d => d.label)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");

    console.log("✅ Line chart rendered.");
  } catch (err) {
    console.error("❌ Failed to load or draw chart:", err);
    chartContainer.innerHTML = `<p class="text-danger">Error loading chart.</p>`;
  }
  ["toggle-wins", "toggle-defeats", "toggle-draws"].forEach(id => {
  const checkbox = document.getElementById(id) as HTMLInputElement;
  if (checkbox) {
    checkbox.onchange = () => {
      const liveTeamName = document.getElementById("team-name")?.textContent;
      if (liveTeamName) {
        drawTeamWinsChart(liveTeamName);
      }
    };
  }
});

}


function drawTeamSpendingChart(teamName: string) {
  const chartContainer = document.getElementById("spending-chart");
  if (!chartContainer) {
    console.warn("❌ Chart container element #spending-chart not found.");
    return;
  }

  chartContainer.innerHTML = ""; // Clear previous chart

  const matchedStatsEntry = data.find(
    (d: any) => d.team === teamName || d.transfers_name === teamName
  );
  const resolvedTransferName = (matchedStatsEntry?.transfers_name || teamName).trim();

  const showSpending = (document.getElementById("toggle-spending") as HTMLInputElement)?.checked;
  const showSales = (document.getElementById("toggle-sales") as HTMLInputElement)?.checked;

  if (!showSpending && !showSales) {
    chartContainer.innerHTML = `<p class="text-muted">Select at least one option to display data.</p>`;
    return;
  }

  try {
    const filtered = transfersData.filter(
      (d: any) =>
        parseInt(d.season.split("-")[0]) >= currentYearRange[0] &&
        parseInt(d.season.split("-")[0]) <= currentYearRange[1] &&
        (d.team_to?.trim() === resolvedTransferName.trim() || d.team_from?.trim() === resolvedTransferName.trim())
    );

    const grouped = d3.rollups(
      filtered,
      entries => ({
      total_spent: d3.sum(entries.filter(d => d.team_to?.trim() === resolvedTransferName), d => +d.transfer_fee),
      total_sold: d3.sum(entries.filter(d => d.team_from?.trim() === resolvedTransferName), d => +d.transfer_fee)
    }),
      d => d.season
    );

    const data = grouped.map(([season, totals]) => ({
      season,
      total_spent: totals.total_spent,
      total_sold: totals.total_sold
    })).sort((a, b) => d3.ascending(a.season, b.season));

    if (data.length === 0 || (data.every(d => d.total_spent === 0) && data.every(d => d.total_sold === 0))) {
      chartContainer.innerHTML = `<p class="text-muted">No data available for "${teamName}" in selected years.</p>`;
      return;
      }

    const width = chartContainer.clientWidth || 550;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };

    const svg = d3.select(chartContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scalePoint()
      .domain(data.map(d => d.season))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.total_spent, d.total_sold)) || 1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineSpent = d3.line<any>()
      .x(d => x(d.season)!)
      .y(d => y(d.total_spent))
      .curve(d3.curveMonotoneX);

    const lineSold = d3.line<any>()
      .x(d => x(d.season)!)
      .y(d => y(d.total_sold))
      .curve(d3.curveMonotoneX);

    if (showSpending) {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#0d6efd")
        .attr("stroke-width", 2)
        .attr("d", lineSpent);

      svg.selectAll(".dot-spent")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot-spent")
        .attr("cx", d => x(d.season)!)
        .attr("cy", d => y(d.total_spent))
        .attr("r", 4)
        .attr("fill", "#0d6efd");
    }

    if (showSales) {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#ffc107")
        .attr("stroke-width", 2)
        .attr("d", lineSold);

      svg.selectAll(".dot-sold")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot-sold")
        .attr("cx", d => x(d.season)!)
        .attr("cy", d => y(d.total_sold))
        .attr("r", 4)
        .attr("fill", "#ffc107");
    }

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d => `${(+d / 1e6).toFixed(0)}M €`));

    // Labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height)
      .text("Season");

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(15,${height / 2})rotate(-90)`)
      .text("Transfer Value (€)");

    // Dynamic Legend
    const legendData = [
      showSpending ? { label: "Total Spending", color: "#0d6efd" } : null,
      showSales ? { label: "Total Sales", color: "#ffc107" } : null
    ].filter(Boolean);

    svg.selectAll(".legend")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cx", width - 120)
      .attr("cy", (_, i) => 20 + i * 20)
      .attr("r", 6)
      .style("fill", d => d.color);

    svg.selectAll(".legend-label")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", width - 110)
      .attr("y", (_, i) => 20 + i * 20 + 4)
      .text(d => d.label)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");

    // Checkbox event binding
    ["toggle-spending", "toggle-sales"].forEach(id => {
      const checkbox = document.getElementById(id) as HTMLInputElement;
      if (checkbox) {
        checkbox.onchange = () => {
          const liveTeamName = document.getElementById("team-name")?.textContent;
          if (liveTeamName) {
            drawTeamSpendingChart(liveTeamName);
          }
        };
      }
    });

    console.log("✅ Spending chart rendered.");
  } catch (err) {
    console.error("❌ Failed to load or draw spending chart:", err);
    chartContainer.innerHTML = `<p class="text-danger">Error loading chart.</p>`;
  }
}

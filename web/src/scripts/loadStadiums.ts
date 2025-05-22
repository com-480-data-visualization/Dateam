import * as d3 from 'd3';
import type { Stadium } from './constants';

// Add type declaration for window.fs
declare global {
  interface Window {
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<string>;
    };
  }
}

export async function loadStadiums(): Promise<Stadium[]> {
  try {
    console.log("🔍 Attempting to load stadium data from CSV...");
    
    // Try reading directly from src directory using window.fs.readFile
    const csvPath = 'src/assets/data/mapping/team_logo_mapping_geocoded.csv';
    console.log(`📁 Attempting to read file directly: ${csvPath}`);
    
    try {
      console.log("🔍 Method 1: Reading file directly with window.fs.readFile");
      if (window.fs && window.fs.readFile) {
        const csvText = await window.fs.readFile(csvPath, { encoding: 'utf8' });
        console.log(`✅ Successfully read file! Length: ${csvText.length} characters`);
        console.log(`📄 First 200 characters: ${csvText.substring(0, 200)}`);
        
        if (csvText && csvText.length > 0) {
          return processCSVData(csvText);
        }
      } else {
        throw new Error("window.fs.readFile not available");
      }
    } catch (fsError) {
      console.log("❌ Direct file read failed:", fsError);
      console.log("🔄 Falling back to fetch method...");
    }
    
    // If direct file read failed, try the original fetch approach
    console.log("🔍 Method 2: Trying fetch approach as fallback");
    const fetchPath = '/assets/data/mapping/team_logo_mapping_geocoded.csv';
    console.log(`📁 Attempting to fetch from path: ${fetchPath}`);
    console.log(`🌐 Current origin: ${window.location.origin}`);
    console.log(`📍 Full URL will be: ${window.location.origin}${fetchPath}`);
    
    try {
      console.log("🔍 Attempting GET request with detailed logging");
      const response = await fetch(fetchPath, {
        headers: {
          'Accept': 'text/csv,text/plain,application/octet-stream,*/*'
        }
      });
      
      console.log(`📊 Response details:`);
      console.log(`  - Status: ${response.status} ${response.statusText}`);
      console.log(`  - Content-Type: ${response.headers.get('content-type')}`);
      console.log(`  - Content-Length: ${response.headers.get('content-length')}`);
      console.log(`  - URL: ${response.url}`);
      console.log(`  - Redirected: ${response.redirected}`);
      
      // Log all response headers for debugging
      console.log(`📋 All response headers:`);
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      if (response.ok) {
        const text = await response.text();
        console.log(`📄 Response text length: ${text.length}`);
        console.log(`📄 First 200 characters: ${text.substring(0, 200)}`);
        console.log(`📄 Last 200 characters: ${text.substring(Math.max(0, text.length - 200))}`);
        
        // More sophisticated content detection
        const isHtml = text.trim().toLowerCase().startsWith('<!doctype html>') || 
                      text.trim().toLowerCase().startsWith('<html') ||
                      text.includes('<title>') ||
                      text.includes('<body>');
        
        const looksLikeCsv = text.includes(',') && 
                           !isHtml && 
                           text.split('\n').length > 1;
        
        console.log(`🔍 Content analysis:`);
        console.log(`  - Is HTML: ${isHtml}`);
        console.log(`  - Looks like CSV: ${looksLikeCsv}`);
        console.log(`  - Line count: ${text.split('\n').length}`);
        
        if (looksLikeCsv) {
          console.log("✅ CSV loaded successfully via fetch");
          return processCSVData(text);
        } else {
          console.log("❌ Content doesn't appear to be valid CSV");
          if (isHtml) {
            console.log("🚨 Received HTML content - likely a 404 or error page");
            // Try to extract title or error info from HTML
            const titleMatch = text.match(/<title>(.*?)<\/title>/i);
            if (titleMatch) {
              console.log(`📝 HTML page title: ${titleMatch[1]}`);
            }
          }
        }
      } else {
        console.log(`❌ HTTP error: ${response.status} ${response.statusText}`);
        
        // Try to get error details
        try {
          const errorText = await response.text();
          console.log(`📄 Error response body: ${errorText.substring(0, 500)}`);
        } catch (e) {
          console.log("Could not read error response body");
        }
      }
    } catch (fetchError) {
      console.log("❌ Fetch request failed completely:", fetchError);
      
      // Additional debugging for network issues
      if (fetchError instanceof TypeError) {
        console.log("🌐 Network error - possibly CORS, file not found, or network connectivity issue");
      }
    }
    
    // If all approaches failed, use hardcoded data
    console.log("⚠️ All methods failed, falling back to hardcoded stadium data");
    console.log("💡 Try these solutions:");
    console.log("  1. Move CSV to public/assets/data/mapping/ directory");
    console.log("  2. Check if your build tool supports serving files from src/");
    console.log("  3. Configure your dev server to serve static files from src/assets/");
    
    return getHardcodedStadiums();
    
  } catch (error) {
    console.error('❌ Unexpected error loading stadium data:', error);
    return getHardcodedStadiums();
  }
}

// Enhanced CSV processing function with detailed debugging for missing teams
function processCSVData(csvText: string): Stadium[] {
  console.log("🔄 Processing CSV data...- obligeee");
  
  try {
    const data = d3.csvParse(csvText);
    console.log(`✅ Parsed ${data.length} rows from CSV - obligeee`);

    // Add quick search for target teams right after parsing
    console.log("\n🔍 QUICK SEARCH FOR TARGET TEAMS:");
    console.log("==========================================");

    const targetTeams = ['Real Madrid', 'Lyon', 'Olympique Lyon', 'Real Madrid CF', 'FC Barcelona', 'Barcelona'];

    targetTeams.forEach(target => {
      console.log(`\n🎯 Searching for: "${target}"`);
      
      // Exact matches
      const exactMatches = data.filter((team: any) => 
        team.team_long_name?.toLowerCase() === target.toLowerCase()
      );
      
      // Partial matches
      const partialMatches = data.filter((team: any) => 
        team.team_long_name?.toLowerCase().indexOf(target.toLowerCase()) !== -1 ||
        target.toLowerCase().indexOf(team.team_long_name?.toLowerCase() || '') !== -1
      );
      
      if (exactMatches.length > 0) {
        console.log(`  ✅ EXACT MATCHES (${exactMatches.length}):`);
        exactMatches.forEach((match: any) => {
          console.log(`    - ${match.team_long_name} | Score: ${match.match_score} | Lat: ${match.latitude} | Lon: ${match.longitude} | Logo: ${match.logo_filename}`);
        });
      }
      
      if (partialMatches.length > 0) {
        console.log(`  🔍 PARTIAL MATCHES (${partialMatches.length}):`);
        partialMatches.forEach((match: any) => {
          console.log(`    - ${match.team_long_name} | Score: ${match.match_score} | Lat: ${match.latitude} | Lon: ${match.longitude} | Logo: ${match.logo_filename}`);
        });
      }
      
      if (exactMatches.length === 0 && partialMatches.length === 0) {
        console.log(`  ❌ NO MATCHES FOUND`);
      }
    });

    // Also search for any team with "madrid" or "lyon" in the name
    console.log(`\n🔍 BROAD SEARCH (any team with madrid/lyon/barcelona):`);
    const broadMatches = data.filter((team: any) => {
      const name = team.team_long_name?.toLowerCase() || '';
      return name.indexOf('madrid') !== -1 || name.indexOf('lyon') !== -1 || 
             name.indexOf('barcelona') !== -1 || name.indexOf('real') !== -1;
    });

    if (broadMatches.length > 0) {
      console.log(`Found ${broadMatches.length} teams:`);
      broadMatches.forEach((match: any) => {
        console.log(`  - ${match.team_long_name} | Score: ${match.match_score} | Lat: ${match.latitude} | Lon: ${match.longitude}`);
      });
    } else {
      console.log(`❌ No teams found with madrid/lyon/barcelona/real in name`);
    }

    console.log("==========================================\n");
    
    // Enhanced column analysis
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`📊 Available columns (${columns.length}):`, columns);
      console.log("📋 Sample row data:", data[0]);
      
      // Check for expected columns
      const expectedColumns = ['team_long_name', 'latitude', 'longitude', 'match_score', 'logo_filename'];
      const missingColumns = expectedColumns.filter(col => columns.indexOf(col) === -1);
      const extraColumns = columns.filter(col => expectedColumns.indexOf(col) === -1);
      
      if (missingColumns.length > 0) {
        console.log(`⚠️ Missing expected columns: ${missingColumns.join(', ')}`);
      }
      if (extraColumns.length > 0) {
        console.log(`ℹ️ Additional columns found: ${extraColumns.join(', ')}`);
      }
    }
    
    const stadiums: Stadium[] = [];
    const filteredOut: any[] = [];
    const detailedLog: any[] = [];
    
    // Arrays to track specific teams we're looking for
    const targetTeamsSearch = ['Real Madrid', 'Lyon', 'Olympique Lyon', 'Real Madrid CF', 'FC Barcelona'];
    const foundTargets: any[] = [];
    console.log(`✅ Parsed ${data.length} rows from CSV before the checking for the teams`);
    // Process each team in the CSV with enhanced error tracking
    for (const team of data) {
      const teamName = team.team_long_name;
      const latStr = team.latitude || '';
      const lonStr = team.longitude || '';
      const matchScoreStr = team.match_score || '0';
      const logoFilename = team.logo_filename;
      
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lonStr);
      const matchScore = parseFloat(matchScoreStr);
      
      // Enhanced validation
      const validLat = !isNaN(latitude) && latitude >= -90 && latitude <= 90;
      const validLon = !isNaN(longitude) && longitude >= -180 && longitude <= 180;
      const validScore = !isNaN(matchScore);
      const hasLogo = !!logoFilename;
      const hasName = !!teamName;
      const scoreThreshold = matchScore > 80;
      
      // Check if this is one of our target teams
      const isTargetTeam = targetTeamsSearch.some(target => 
        teamName?.toLowerCase().indexOf(target.toLowerCase()) !== -1 || 
        target.toLowerCase().indexOf(teamName?.toLowerCase() || '') !== -1
      );
      
      if (isTargetTeam) {
        foundTargets.push({
          teamName,
          latitude: latStr,
          longitude: lonStr,
          matchScore: matchScoreStr,
          logoFilename,
          validLat,
          validLon,
          validScore,
          hasLogo,
          hasName,
          scoreThreshold,
          passesAllChecks: validLat && validLon && hasLogo && hasName && validScore && scoreThreshold
        });
      }
      console.log(`✅ Parsed ${data.length} rows from CSV fater the checking for the teams`);
      // Log detailed info for first 10 teams and all target teams
      if (detailedLog.length < 10 || isTargetTeam) {
        detailedLog.push({
          teamName: teamName || 'UNNAMED',
          latitude: `${latStr} -> ${latitude} (valid: ${validLat})`,
          longitude: `${lonStr} -> ${longitude} (valid: ${validLon})`,
          matchScore: `${matchScoreStr} -> ${matchScore} (valid: ${validScore}, >50: ${scoreThreshold})`,
          logo: `${logoFilename} (has logo: ${hasLogo})`,
          name: `${teamName} (has name: ${hasName})`,
          result: validLat && validLon && hasLogo && hasName && validScore && scoreThreshold ? '✅ INCLUDED' : '❌ FILTERED OUT'
        });
      }
      
      if (validLat && validLon && hasLogo && hasName && validScore && scoreThreshold) {
        stadiums.push({
          name: teamName,
          coords: [latitude, longitude],
          logo: `/assets/logos/${logoFilename}`
        });
      } else {
        // Track why teams were filtered out
        const reasons = [];
        if (!validLat) reasons.push('Invalid latitude');
        if (!validLon) reasons.push('Invalid longitude');
        if (!hasLogo) reasons.push('Missing logo filename');
        if (!hasName) reasons.push('Missing team name');
        if (!validScore) reasons.push('Invalid match score');
        if (!scoreThreshold) reasons.push(`Match score too low (${matchScore} <= 50)`);
        
        filteredOut.push({
          teamName: teamName || 'UNNAMED',
          reasons: reasons,
          data: { latStr, lonStr, matchScoreStr, logoFilename }
        });
      }
    }
    
    // Log detailed processing results
    console.log(`\n📊 DETAILED PROCESSING RESULTS:`);
    console.log(`==========================================`);
    detailedLog.forEach((entry, index) => {
      console.log(`\n🏟️ Team ${index + 1}: ${entry.teamName}`);
      console.log(`  📍 Latitude: ${entry.latitude}`);
      console.log(`  📍 Longitude: ${entry.longitude}`);
      console.log(`  📊 Match Score: ${entry.matchScore}`);
      console.log(`  🖼️ Logo: ${entry.logo}`);
      console.log(`  📝 Name: ${entry.name}`);
      console.log(`  ${entry.result}`);
    });
    
    // Special focus on target teams
    console.log(`\n🎯 TARGET TEAMS ANALYSIS:`);
    console.log(`==========================================`);
    if (foundTargets.length > 0) {
      foundTargets.forEach(target => {
        console.log(`\n🔍 Found: ${target.teamName}`);
        console.log(`  📍 Coordinates: ${target.latitude}, ${target.longitude}`);
        console.log(`  📊 Match Score: ${target.matchScore}`);
        console.log(`  🖼️ Logo: ${target.logoFilename}`);
        console.log(`  ✅ Valid Lat: ${target.validLat}`);
        console.log(`  ✅ Valid Lon: ${target.validLon}`);
        console.log(`  ✅ Valid Score: ${target.validScore}`);
        console.log(`  ✅ Has Logo: ${target.hasLogo}`);
        console.log(`  ✅ Has Name: ${target.hasName}`);
        console.log(`  ✅ Score > 50: ${target.scoreThreshold}`);
        console.log(`  🏆 FINAL RESULT: ${target.passesAllChecks ? '✅ INCLUDED' : '❌ FILTERED OUT'}`);
      });
    } else {
      console.log(`❌ No target teams found in CSV data!`);
      
      // Search for partial matches
      console.log(`\n🔍 Searching for partial matches...`);
      const partialMatches = data.filter((team: any) => {
        const name = team.team_long_name?.toLowerCase() || '';
        return name.indexOf('madrid') !== -1 || name.indexOf('real') !== -1 || 
               name.indexOf('lyon') !== -1 || name.indexOf('barcelona') !== -1;
      });
      
      if (partialMatches.length > 0) {
        console.log(`Found ${partialMatches.length} partial matches:`);
        partialMatches.forEach((match: any) => {
          console.log(`  - ${match.team_long_name} (score: ${match.match_score})`);
        });
      }
    }
    
    // Summary of filtered out teams
    console.log(`\n📈 FILTERING SUMMARY:`);
    console.log(`==========================================`);
    console.log(`  📊 Total rows processed: ${data.length}`);
    console.log(`  ✅ Teams included: ${stadiums.length}`);
    console.log(`  ❌ Teams filtered out: ${filteredOut.length}`);
    
    // Top reasons for filtering
    const reasonCounts: { [key: string]: number } = {};
    filteredOut.forEach(team => {
      team.reasons.forEach((reason: string) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });
    
    console.log(`\n🚫 TOP REASONS FOR FILTERING:`);
    // Use compatible array methods
    const reasonEntries: [string, number][] = [];
    for (const key in reasonCounts) {
      if (reasonCounts.hasOwnProperty(key)) {
        reasonEntries.push([key, reasonCounts[key]]);
      }
    }
    reasonEntries.sort((a, b) => b[1] - a[1]);
    
    reasonEntries.forEach(([reason, count]) => {
      console.log(`  - ${reason}: ${count} teams`);
    });
    
    // Show some examples of filtered teams
    console.log(`\n📋 EXAMPLES OF FILTERED TEAMS:`);
    filteredOut.slice(0, 10).forEach(team => {
      console.log(`  ❌ ${team.teamName}: ${team.reasons.join(', ')}`);
    });
    
    if (stadiums.length > 0) {
      return stadiums;
    } else {
      console.log("⚠️ No valid stadiums found in CSV data, using hardcoded data");
      return getHardcodedStadiums();
    }
  } catch (parseError) {
    console.log("❌ Error parsing CSV:", parseError);
    return getHardcodedStadiums();
  }
}

// Enhanced fallback function with more teams for testing
function getHardcodedStadiums(): Stadium[] {
  console.log("📍 Using hardcoded stadium data as fallback");
  
  return [
    {
      name: "FC Barcelona",
      coords: [41.3809, 2.1228],
      logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
    },
    {
      name: "Real Madrid",
      coords: [40.4530, -3.6883],
      logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
    },
    {
      name: "Manchester United",
      coords: [53.4631, -2.2913],
      logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
    },
    {
      name: "Liverpool FC",
      coords: [53.4308, -2.9608],
      logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
    },
    {
      name: "Bayern Munich",
      coords: [48.2188, 11.6247],
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg"
    },
    {
      name: "Paris Saint-Germain",
      coords: [48.8414, 2.2530],
      logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg"
    },
    {
      name: "Chelsea FC",
      coords: [51.4817, -0.1910],
      logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg"
    },
    {
      name: "Juventus",
      coords: [45.1096, 7.6409],
      logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c5/Logo_Juventus_FC_2020.svg/500px-Logo_Juventus_FC_2020.svg.png"
    },
    {
      name: "AC Milan",
      coords: [45.4791, 9.1239],
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg"
    },
    {
      name: "Arsenal FC",
      coords: [51.5549, -0.1084],
      logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
    },
    {
      name: "Borussia Dortmund",
      coords: [51.4926, 7.4518],
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"
    },
    {
      name: "Atletico Madrid",
      coords: [40.4361, -3.5995],
      logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/fc/Logo_ATM_2024.svg/500px-Logo_ATM_2024.svg.png"
    }
  ];
}
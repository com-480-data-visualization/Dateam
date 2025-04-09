import * as d3 from 'd3';
import type { Stadium } from './constants';

export async function loadStadiums(): Promise<Stadium[]> {
  try {
    console.log("🔍 Attempting to load stadium data from CSV...");
    
    // Try multiple approaches to load the CSV
    let csvText: string | null = null;
    let successMethod = '';
    
    // Approach 1: Regular fetch with accept headers
    try {
      console.log("Trying approach 1: Fetch with Accept headers");
      const response = await fetch('/data/mapping/team_logo_mapping_geocoded.csv', {
        headers: {
          'Accept': 'text/csv,application/octet-stream'
        }
      });
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const text = await response.text();
        if (!text.includes('<!doctype html>') && !text.includes('<html') && text.includes(',')) {
          csvText = text;
          successMethod = 'fetch + headers';
          console.log("✅ CSV loaded with fetch + headers approach");
        } else {
          console.log("❌ Received HTML or invalid data with fetch + headers approach");
        }
      }
    } catch (e) {
      console.log("Fetch with headers approach failed:", e);
    }
    
    // Approach 2: Try with query parameter if first approach failed
    if (!csvText) {
      try {
        console.log("Trying approach 2: Fetch with query parameter");
        const cacheBust = Date.now();
        const response = await fetch(`/data/mapping/team_logo_mapping_geocoded.csv?raw=true&_=${cacheBust}`);
        
        console.log(`Response status: ${response.status}`);
        console.log(`Response type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const text = await response.text();
          if (!text.includes('<!doctype html>') && !text.includes('<html') && text.includes(',')) {
            csvText = text;
            successMethod = 'query parameter';
            console.log("✅ CSV loaded with query parameter approach");
          } else {
            console.log("❌ Received HTML or invalid data with query parameter approach");
          }
        }
      } catch (e) {
        console.log("Query parameter approach failed:", e);
      }
    }
    
    // Approach 3: XMLHttpRequest if previous approaches failed
    if (!csvText) {
      try {
        console.log("Trying approach 3: XMLHttpRequest");
        
        csvText = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', '/data/mapping/team_logo_mapping_geocoded.csv');
          xhr.responseType = 'text';
          xhr.onload = () => {
            console.log(`XHR status: ${xhr.status}`);
            console.log(`XHR content type: ${xhr.getResponseHeader('content-type')}`);
            
            const text = xhr.response;
            if (!text.includes('<!doctype html>') && !text.includes('<html') && text.includes(',')) {
              resolve(text);
            } else {
              reject(new Error("Received HTML instead of CSV"));
            }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send();
        });
        
        successMethod = 'XMLHttpRequest';
        console.log("✅ CSV loaded with XMLHttpRequest approach");
      } catch (e) {
        console.log("XMLHttpRequest approach failed:", e);
      }
    }
    
    // Approach 4: Try a different path
    if (!csvText) {
      try {
        console.log("Trying approach 4: Alternative path");
        // Try a direct path to the root
        const response = await fetch('/team_logo_mapping_geocoded.csv');
        
        console.log(`Response status: ${response.status}`);
        console.log(`Response type: ${response.headers.get('content-type')}`);
        
        if (response.ok) {
          const text = await response.text();
          if (!text.includes('<!doctype html>') && !text.includes('<html') && text.includes(',')) {
            csvText = text;
            successMethod = 'alternative path';
            console.log("✅ CSV loaded with alternative path approach");
          } else {
            console.log("❌ Received HTML or invalid data with alternative path approach");
          }
        }
      } catch (e) {
        console.log("Alternative path approach failed:", e);
      }
    }
    
    // If we have CSV text, process it
    if (csvText) {
      console.log(`✅ CSV loaded successfully using ${successMethod}`);
      console.log(`CSV length: ${csvText.length} characters`);
      console.log(`First 100 characters: ${csvText.substring(0, 100)}`);
      
      const data = d3.csvParse(csvText);
      console.log(`✅ Parsed ${data.length} rows from CSV`);
      
      // Show what columns we have
      if (data.length > 0) {
        console.log("Available columns:", Object.keys(data[0]));
        console.log("Sample row data:", data[0]);
      }
      
      const stadiums: Stadium[] = [];
      
      // Process each team in the CSV
      for (const team of data) {
        const teamName = team.team_long_name;
        const latitude = parseFloat(team.latitude || '');
        const longitude = parseFloat(team.longitude || '');
        const matchScore = parseFloat(team.match_score || '0');
        const logoFilename = team.logo_filename;
        
        if (
          !isNaN(latitude) &&
          !isNaN(longitude) &&
          logoFilename &&
          teamName &&
          matchScore > 90
        ) {
          stadiums.push({
            name: teamName,
            coords: [latitude, longitude],
            logo: `/data/logos/${logoFilename}`
          });
        }
      }
      
      console.log(`✅ Created ${stadiums.length} stadium objects from CSV`);
      
      if (stadiums.length > 0) {
        return stadiums;
      }
    }
    
    // If all approaches failed or no valid stadiums, use hardcoded data
    console.log("⚠️ No CSV data could be loaded, using hardcoded stadium data");
    return getHardcodedStadiums();
    
  } catch (error) {
    console.error('❌ Error loading stadium data:', error);
    return getHardcodedStadiums();
  }
}

// Fallback function for hardcoded data
function getHardcodedStadiums(): Stadium[] {
  console.log("Using hardcoded stadium data");
  
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
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg"
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
      logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg"
    }
  ];
}
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

export async function loadStatiums(): Promise<Stadium[]> {
  return fetch("./assets/data/mapping/team_logo_mapping_geocoded.csv")
    .then(csvData => csvData.text())
    .then(processCSVData);
}

// Enhanced CSV processing function with detailed debugging for missing teams
function processCSVData(csvText: string): Stadium[] {
  try {
    const data = d3.csvParse(csvText);

    const stadiums: Stadium[] = [];

    // Process each team in the CSV with enhanced error tracking
    for (const team of data) {
      const teamName = team.team_long_name;
      const teamTransfersName = team.transfers_name;
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
      if (validLat && validLon && hasLogo && hasName && validScore && scoreThreshold) {
        stadiums.push({
          name: teamName,
          coords: [latitude, longitude],
          logo: `/assets/logos/${logoFilename}`,
          transfers_name: teamTransfersName
        });
      }
    }
    return stadiums;

  } catch (parseError) {
    console.log("❌ Error parsing CSV:", parseError);
    return [
      {
        name: "FC Barcelona",
        coords: [41.3809, 2.1228],
        logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
        transfers_name: "FC Barcelona"
      },
      {
        name: "Real Madrid",
        coords: [40.4530, -3.6883],
        logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
        transfers_name: "Real Madrid"
      },
      {
        name: "Manchester United",
        coords: [53.4631, -2.2913],
        logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
        transfers_name: "Manchester United"
      },
      {
        name: "Liverpool FC",
        coords: [53.4308, -2.9608],
        logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
        transfers_name: "Liverpool FC"
      },
      {
        name: "Bayern Munich",
        coords: [48.2188, 11.6247],
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
        transfers_name: "Bayern Munich"
      },
      {
        name: "Paris Saint-Germain",
        coords: [48.8414, 2.2530],
        logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
        transfers_name: "Paris Saint-Germain"
      },
      {
        name: "Chelsea FC",
        coords: [51.4817, -0.1910],
        logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
        transfers_name: "Chelsea FC"
      },
      {
        name: "Juventus",
        coords: [45.1096, 7.6409],
        logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c5/Logo_Juventus_FC_2020.svg/500px-Logo_Juventus_FC_2020.svg.png",
        transfers_name: "Juventus"
      },
      {
        name: "AC Milan",
        coords: [45.4791, 9.1239],
        logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
        transfers_name: "AC Milan"
      },
      {
        name: "Arsenal FC",
        coords: [51.5549, -0.1084],
        logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
        transfers_name: "Arsenal FC"
      },
      {
        name: "Borussia Dortmund",
        coords: [51.4926, 7.4518],
        logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
        transfers_name: "Borussia Dortmund"
      },
      {
        name: "Atletico Madrid",
        coords: [40.4361, -3.5995],
        logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/fc/Logo_ATM_2024.svg/500px-Logo_ATM_2024.svg.png",
        transfers_name: "Atletico Madrid"
      }
    ];
  }
}

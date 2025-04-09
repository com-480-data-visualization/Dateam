import type { Stadium } from './constants';

export async function loadStadiums(): Promise<Stadium[]> {
  const response = await fetch('./data/team_logo_mapping_geocoded.csv');
  const text = await response.text();

  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');

  const stadiums: Stadium[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');

    const team_name = cols[headers.indexOf('team_name')];
    const latitude = parseFloat(cols[headers.indexOf('latitude')]);
    const longitude = parseFloat(cols[headers.indexOf('longitude')]);
    const logo_name = cols[headers.indexOf('logo_name')];
    const match_score = parseFloat(cols[headers.indexOf('match_score')]);

    if (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      logo_name &&
      team_name &&
      match_score > 90
    ) {
      stadiums.push({
        name: team_name,
        coords: [latitude, longitude],
        logo: `/data/logos/${logo_name}`
      });
    }
  }

  return stadiums;
}

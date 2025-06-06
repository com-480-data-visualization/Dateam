import iStadiums from "../assets/data/stadiums.json";
import iTransfers from "../assets/data/transfers_with_geodata.json";


export const YEARS = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015]; //, 2016, 2017, 2018

export interface Stadium {
  name: string;
  coords: [number, number];
  logo: string;
  transfers_name: string;  // mapping to the transfer file
}

export interface Transfer {
  name: string,
  position: string,
  age: number,
  team_from: string,
  league_from: string,
  team_to: string,
  league_to: string,
  season: string,
  transfer_fee: number,
  latlon_from: number[],
  latlon_to: number[]
}

// This empty array will be populated by loadStadiums() function
export let stadiums: Stadium[] = iStadiums.map(iStadium => {
  return {
    name: iStadium.name,
    coords: iStadium.coords as [number, number],
    transfers_name: iStadium.transfers_name,
    logo: iStadium.logo,
}});

// Fallback stadiums in case the CSV loading fails
export const fallbackStadiums: Stadium[] = [
  {
    name: "FC Barcelona",
    coords: [41.3809, 2.1228],
    logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
    transfers_name: "FC Barcelona"
  },
  {
    name: "Manchester United",
    coords: [53.4631, -2.2913],
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
    transfers_name: "FC Barcelona"
  }
];

export const transfers = iTransfers;

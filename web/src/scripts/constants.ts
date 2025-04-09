

export const YEARS = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];

export interface Stadium {
    name: string;
    coords: [number, number];
    logo: string;
  }
  
  export const stadiums: Stadium[] = [
    {
      name: "FC Barcelona",
      coords: [41.3809, 2.1228],
      logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
    },
    {
      name: "Manchester United",
      coords: [53.4631, -2.2913],
      logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg"
    }
  ];
  
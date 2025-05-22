"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfers = exports.fallbackStadiums = exports.stadiums = exports.YEARS = void 0;
const transfers_with_geodata_json_1 = __importDefault(require("../assets/data/transfers_with_geodata.json"));
exports.YEARS = [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015]; //, 2016, 2017, 2018
// This empty array will be populated by loadStadiums() function
exports.stadiums = [];
// Fallback stadiums in case the CSV loading fails
exports.fallbackStadiums = [
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
exports.transfers = transfers_with_geodata_json_1.default;

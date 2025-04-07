import * as d3 from 'd3'

import { YearSelectorService } from './scripts/year-selector';


const yearSelectorService = new YearSelectorService();
yearSelectorService.init();

console.log(yearSelectorService.currentYearPeriod);
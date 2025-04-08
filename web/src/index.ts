import * as d3 from 'd3'

import { YearSelectorService } from './scripts/year-selector';
import { ScrollSidebar } from './scripts/sidebar';


const yearSelectorService = new YearSelectorService();
yearSelectorService.init();

console.log(yearSelectorService.currentYearPeriod);

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = new ScrollSidebar("sidebar-scroll");
  
    // Example content
    const itemList = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
    sidebar.init(itemList);
  });
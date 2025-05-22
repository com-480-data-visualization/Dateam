"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearSelectorService = void 0;
const constants_1 = require("./constants");
class YearSelectorService {
    constructor() {
        this.currentYearPeriod = [];
        this.currentYearPeriod = [constants_1.YEARS[0], constants_1.YEARS[constants_1.YEARS.length - 1]];
    }
    init() {
        const onYearClick = (year, from, inputElement) => {
            if (from) {
                if (year <= this.currentYearPeriod[1]) {
                    this.currentYearPeriod[0] = year;
                    inputElement.value = year.toString();
                }
            }
            else if (this.currentYearPeriod[0] <= year) {
                this.currentYearPeriod[1] = year;
                inputElement.value = year.toString();
            }
            document.dispatchEvent(new CustomEvent("yearSelectorChanged", { detail: { newYears: this.currentYearPeriod } }));
        };
        const selectFrom = document.getElementById("dropdown-years-from");
        const inputFrom = document.getElementById("input-years-from");
        const selectTo = document.getElementById("dropdown-years-to");
        const inputTo = document.getElementById("input-years-to");
        [selectFrom, selectTo].forEach((select, i) => {
            const fragment = document.createDocumentFragment();
            constants_1.YEARS.forEach(y => {
                const from = i == 0;
                const link = document.createElement("a");
                link.setAttribute("class", "dropdown-item choose-year");
                link.innerText = y.toString();
                link.onclick = (e) => onYearClick(y, from, from ? inputFrom : inputTo);
                const el = document.createElement("li");
                el.appendChild(link);
                fragment.appendChild(el);
            });
            select.append(fragment);
        });
        inputFrom.value = this.currentYearPeriod[0].toString();
        inputTo.value = this.currentYearPeriod[this.currentYearPeriod.length - 1].toString();
        console.log("Year selector init OK");
    }
}
exports.YearSelectorService = YearSelectorService;

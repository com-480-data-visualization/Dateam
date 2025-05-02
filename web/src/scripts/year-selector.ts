import { YEARS } from "./constants";

export class YearSelectorService {
    public currentYearPeriod: number[] = [];

    constructor () {
        this.currentYearPeriod = [YEARS[0], YEARS[YEARS.length - 1]];
    }

    public init() {
        const onYearClick = (year: number, from: boolean, inputElement: HTMLInputElement) => {
            if (from) {
                if (year <= this.currentYearPeriod[1]) {
                    this.currentYearPeriod[0] = year;
                    inputElement.value = year.toString();
                }
            } else if (this.currentYearPeriod[0] <= year) {
                this.currentYearPeriod[1] = year;
                inputElement.value = year.toString();
            }
            document.dispatchEvent(new CustomEvent("yearSelectorChanged", {detail: {newYears: this.currentYearPeriod}}));
        }
        
        const selectFrom = document.getElementById("dropdown-years-from");
        const inputFrom = document.getElementById("input-years-from") as HTMLInputElement;
        const selectTo = document.getElementById("dropdown-years-to");
        const inputTo = document.getElementById("input-years-to") as HTMLInputElement;
    
        [selectFrom, selectTo].forEach((select, i) => {
            const fragment = document.createDocumentFragment();
            YEARS.forEach(y => {
                const from = i == 0;
                const link = document.createElement("a");
                link.setAttribute("class", "dropdown-item choose-year");
                link.innerText = y.toString();
                link.onclick = (e: MouseEvent) => onYearClick(y, from, from ? inputFrom : inputTo);
                const el = document.createElement("li");
                el.appendChild(link)
                fragment.appendChild(el);
            });
            select.append(fragment);
        });
    
        inputFrom.value = this.currentYearPeriod[0].toString();
        inputTo.value = this.currentYearPeriod[this.currentYearPeriod.length - 1].toString();

        console.log("Year selector init OK");
    }
}


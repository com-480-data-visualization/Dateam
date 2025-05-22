export class ScrollSidebar {
    constructor(containerId) {
        const el = document.getElementById(containerId);
        if (!el)
            throw new Error(`Element with id "${containerId}" not found`);
        this.container = el;
    }
    init(items) {
        this.container.innerHTML = ""; // clear if needed
        items.forEach((itemText, i) => {
            const item = document.createElement("div");
            item.textContent = itemText;
            item.className = "p-2 border-bottom text-center small-item";
            item.style.cursor = "pointer";
            item.addEventListener("click", () => {
                alert(`You clicked item ${i + 1}`);
            });
            this.container.appendChild(item);
        });
    }
}

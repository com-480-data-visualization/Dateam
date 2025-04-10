import { Stadium } from './constants';

type TeamClickCallback = (team: Stadium) => void;

export class ScrollSidebar {
  private container: HTMLElement;
  private onTeamClick: TeamClickCallback | null = null;

  constructor(containerId: string) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element with id "${containerId}" not found`);
    this.container = el;
  }

  /**
   * Initialize the sidebar with a list of generic items
   */
  public init(items: string[]) {
    this.container.innerHTML = ""; // clear if needed
    
    items.forEach((itemText, i) => {
      const item = document.createElement("div");
      item.textContent = itemText;
      item.className = "p-2 border-bottom text-center sidebar-item";
      item.style.cursor = "pointer";
      item.addEventListener("click", () => {
        alert(`You clicked item ${i + 1}`);
      });

      this.container.appendChild(item);
    });
  }

  /**
   * Initialize the sidebar with teams, displaying their logos
   */
  public initWithTeams(teams: Stadium[], onTeamSelected: TeamClickCallback) {
    this.container.innerHTML = ""; // Clear existing content
    this.onTeamClick = onTeamSelected;
    
    // Add header
    const header = document.createElement("div");
    header.className = "p-2 bg-primary text-white text-center fw-bold";
    header.textContent = "Teams";
    this.container.appendChild(header);
    
    // Sort teams alphabetically by name
    const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name));
    
    // Add team logos
    sortedTeams.forEach((team) => {
      this.addTeamToSidebar(team);
    });
  }
  
  /**
   * Add a single team to the sidebar
   */
  private addTeamToSidebar(team: Stadium) {
    // Create container
    const teamContainer = document.createElement("div");
    teamContainer.className = "sidebar-team p-2 border-bottom text-center";
    teamContainer.title = team.name; // Show name on hover
    teamContainer.style.cursor = "pointer";
    
    // Create logo image
    const logo = document.createElement("img");
    logo.src = team.logo;
    logo.alt = team.name;
    logo.className = "sidebar-team-logo";
    logo.style.width = "40px";
    logo.style.height = "40px";
    logo.style.objectFit = "contain";
    
    // Add error handler for logo
    logo.onerror = () => {
      logo.src = "./assets/placeholder-logo.svg"; // Fallback logo
      console.warn(`Failed to load logo for ${team.name}`);
    };
    
    // Add click handler
    teamContainer.addEventListener("click", () => {
      if (this.onTeamClick) {
        this.onTeamClick(team);
      }
    });
    
    // Append to container
    teamContainer.appendChild(logo);
    this.container.appendChild(teamContainer);
  }
  
  /**
   * Update the sidebar when teams change
   */
  public updateTeams(teams: Stadium[]) {
    if (this.onTeamClick) {
      this.initWithTeams(teams, this.onTeamClick);
    }
  }
}
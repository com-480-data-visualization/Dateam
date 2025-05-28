# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Chritin Mathurin Raphaël | 288065 |
| Schwabedal Georg Tilman Peter | 328434 |
| Gafsi Amene| 345583 |

[Milestone 1](#milestone-1-21st-march-5pm) • [Milestone 2](#milestone-2-18th-april-5pm) • [Milestone 3](#milestone-3-30th-may-5pm)
## Accessing our website
Our website can be easily accessed at:  
[https://com-480-data-visualization.github.io/Dateam/](https://com-480-data-visualization.github.io/Dateam/)

If you want to run the website on your local machine, follow these steps:
1. **Clone the repository**  
   ```bash
   git clone https://github.com/com-480-data-visualization/Dateam.git
2. **Navigate to the web directory**  
   ```bash
   cd Dateam/web
3. **Start the development server**  
   ```bash
   npm run start
4. **Open the website in your browser**  
   Once the server is running, open your browser and go to:  
   [http://localhost:8081](http://localhost:8081)


## Milestone 1 (21st March, 5pm)

**10% of the final grade**

<!-- [Milestone 1 report](milestones/milestone1.md) -->
# Milestone 1 

## **Dataset**

Football is the most popular sport in the world. In this project, we will focus on male football players and match statistics in Europe.

We use two publicly available datasets from Kaggle. The first records all match history from seasons 2008 to 2016, covering over 25,000 matches with detailed statistics, including teams, lineups, and in-game events such as goal types, possession, corners, crosses, fouls, and cards. The second dataset documents football transfers from 2000 to 2018, listing player movements along with their transfer fees, market values, and origin/destination clubs. 

- **Mathien**, “European Soccer Database”, 2017.  
   [Dataset Link](https://www.kaggle.com/datasets/hugomathien/soccer)

- **Slehkyi**, “Football transfers 2000-2018”, 2018.  
   [Dataset Link](https://www.kaggle.com/code/slehkyi/football-transfers-2000-2018)


These two datasets are widely recognized and of high quality, as confirmed by verified feedback. We ensured this by applying basic preprocessing steps and exploring the general data structure through initial visualizations (more details in the Exploratory Data Analysis section).

## **Problematic**

**Overview**:
In modern football, transfers play a crucial role in shaping team success, financial stability, and league competitiveness. Every season, clubs invest heavily in new signings, player development, and strategic transfers to strengthen their squads.  This project aims to analyze football match statistics and player transfers across different leagues and seasons. We will explore detailed match data, player movements, and transfer fees to uncover key trends and assess the impact of transfers on team performance. By studying these factors, we seek to understand how transfers influence team dynamics, squad strength, and overall league competitiveness.

**Motivation**:
Our goal is to provide a clear visual representation of match performance and transfer activity, enabling a deeper understanding of player market trends and their effects on club success. By examining historical data, we can highlight patterns in transfer spending, team strategies, and the financial evolution of the sport.

**Target Audience**:
This visualization could be beneficial for:
- **Football clubs & managers** → Assessing transfer market trends and optimizing team-building strategies.  
- **Football analysts & scouts** → Evaluating player movements, team strategies, and market value fluctuations.  
- **Fans & data enthusiasts** → Gaining insights into player transfers, team performance, and financial trends in football.  

## **Exploratory Data Analysis**

- **European Soccer Database**

This dataset is presented as a .sqlite file, containing several tables. The main tables that we will use are “PLAYER” (~11k entries), “MATCH” (~29k entries), “LEAGUE” (11) and “TEAM” (299). We mention that not all unique players are present in the “MATCH” table, some preprocessing will be done to remove them. Additionally, we provide the two following charts to show the distribution of the number of matches per months across years, which is pretty homogenous, and the top players with the largest amount of matches played.

<table align="center">
  <tr>
    <td align="center">
      <img src="/plots/n_matches_accross_years.png" alt="Number of Matches per Month" width="500" height="350">
    </td>
    <td align="center">
      <img src="/plots/number_of_matches_per_player.png" alt="Players by Number of Matches" width="500" height="350">
    </td>
  </tr>
</table>

- **Football transfers 2000-2018**

The dataset is well-structured in CSV format, requiring no preprocessing. It contains 4,700 transfers recorded between 2000 and 2018, with 10 columns providing detailed information about each transfer.  
The dataset includes the following attributes:  

   - **Player Name**: The name of the transferred football player.  
  - **Selling Team & League**: The club and league the player is transferred from.  
  - **Buying Team & League**: The club and league the player is transferred to.  
  - **Market Value**: The estimated market value of the player at the time of transfer.  
  - **Transfer Fee**: The actual amount paid for the transfer.  
  - **Player Position**: The position in which the player primarily plays.  
  - **Season**: The season when the transfer occurred.  

To better understand the dataset, we conducted Exploratory Data Analysis (EDA). The following visualizations provide an overview of key trends in market dynamics over time, including transfer activity and fee distributions.

<table align="center">
  <tr>
    <td align="center">
      <img src="/plots/top_leagues_by_transfers.png" alt="Top Leagues by Number of Transfers" width="500" height="350">
    </td>
    <td align="center">
      <img src="/plots/top_teams_by_transfers.png" alt="Top Teams by Number of Transfers" width="500" height="350">
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <img src="/plots/transfer_fee_per_season.png" alt="Average Transfer Fee per Season" width="500" height="350">
    </td>
  </tr>
</table>


<p align="center">
  For a detailed analysis, refer to our Jupyter Notebook: <br>
  <a href="analysis.ipynb">Exploratory Data Analysis Notebook</a>
</p>


## **Related work**

**Existing Studies & Insights**  

From a first research following studies have already been performed: 
- **General trends in player transfers** among the top 5 European leagues (Serie A, Bundesliga, Premier League, LaLiga, Ligue 1).  
- **Transfer fees as a function of player age**, analyzing how market value fluctuates based on a player's career stage.  
- **Key factors influencing match outcomes**, using in-depth match statistics to predict results. *(Source: Soccer Database by Sheema Masood, Kaggle)*.  

While these studies provide valuable insights, our approach is different: we aim to go beyond basic transfer statistics by analyzing: 
 - **The relationship between player transfers and team performance**, assessing how new signings impact squad success.  
- **Trends in transfer fees over time**, identifying key financial shifts and market inflation.  
- **Patterns in club strategies**, highlighting how different teams approach transfers based on past success and spending habits.  


Our initial source of inspiration came from this website : [World in Maps - Europe](https://worldinmaps.com/europe/). As it showed how plotting things from a different angle gave a different impression of a metric. The spatial representation of Europe encouraged discussions about football within our group, ultimately sparking the idea for this project.



## Milestone 2 (18th April, 5pm)

**10% of the final grade**

<!-- [Milestone 2 report](milestones/milestone2.md) -->

# Milestone 2 

Data Visualization Project — COM-480

Date: April 18, 2025

## Presentation

As indicated in Milestone 1, our project focuses on the most popular sport in European culture: football. Specifically, we analyze data concerning male football players and clubs from 2006 to 2016. Leveraging two high-quality datasets—one on match statistics and the other on player transfers—we aim to explore how clubs and their performance evolved during this period.

Our objective is to visualize how player transfers influence team performance, and how financial factors shape competitive success. The project offers users an interactive platform to compare teams, observe transfer patterns, and understand spending behavior.

Through maps and team-based visualizations, users can navigate Europe, follow their favorite clubs, and uncover trends in performance, transfers, and expenditures. This platform is designed to serve football fans, analysts, and scouts alike by offering a novel data-driven perspective on the football ecosystem.

## Design sketches 

We began with a brainstorming session and produced the following design sketches to structure our final website layout and content:

<table align="center">
  <tr>
    <td align="center">
      <img src="/plots/Intro.png" alt="Opening page with initial key figures" width="500" height="350">
    </td>
    <td align="center">
      <img src="/plots/Map.png" alt="Interactive Map" width="500" height="350">
    </td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center">
      <img src="/plots/InteractiveMap.png" alt="Outfolding data visualization per selected team" width="500" height="350">
    </td>
    <td align="center">
      <img src="/plots/PageDescirption.png" alt="Final descriptive page" width="500" height="350">
    </td>
  </tr>
</table>

## Tools and Course Concepts

To achieve our design, we’ve identified six key interface components and linked each with the necessary tools and course concepts:
 
- **General**, Initial concept, visual storytelling

    *Course Tools*: Git/GitHub, Design Best Practices, Text Visualization, Storytelling, Perception/Color  

- **Overhead**, Top bar with parameters and navigation  
    
    *Course Tools*: Basic Web Development, Interactions, D3.js  

- **Map**, Geospatial view of clubs and transfers  
    
    *Course Tools*: Maps, Interactions, Leaflet.js  

- **Scrollbar**, Scroll/search feature for club selection  
    
    *Course Tools*: Interactions  

- **Plots**, Visualization of team statistics over time  
    
    *Course Tools*: Graphs, Tabular Data  

- **Side Panel**, Dynamic sidebar with club-specific info  
    
    *Course Tools*: Interactions  


We are using an external dataset to include team logos for visual identity:
- **luukhopman**, “Football Team Logos 2024/2025”, 2024.  
   [Github Repository](https://github.com/luukhopman/football-logos?)


## Initial Challenges 


While implementing the project, we encountered several early-stage obstacles:
- Data Integration: Aligning team names across different datasets (match stats, transfers, logos) proved more complex than expected due to inconsistencies in naming conventions and historical changes. This required extensive filtering and normalization.

- Task Allocation: Initially, roles were unclear. A follow-up meeting with clearly defined objectives and task ownership helped improve clarity and focus.

As we have begun working on the project we have faced some initial challenges we ar ein the midst of resolving. 
- Linking team location to team logo and data. Because of different labelling, changes of european relevance the regrouping of the data per team has taking more time than anticiated. Some rigorous filtering ansd statistical analysis provided solution. 
- Task attibution. The first task distribution was bad and it was unclear who was responsible for that. A meeting which listed the main objetives and necessary steps to reach them helped in identifying priorities for each collaborator. 


## Future Ideas (Optional Enhancements)

Once our minimum viable product is established, we may explore the following enhancements:
- **Advanced** **Team** **Analysis**: Correlate transfer activity with team strengths/weaknesses in attack/defense using deeper statistical analysis.
- **Map**: Enhance transition animations and UI elements in the map visualization.
- **Filter**: Introduce filters by league, budget, or historical success to facilitate more granular comparisons.

## Functional Project Prototype Review

We have a first version of the website up and running. To explore the project locally, please navigate into the `web` directory and follow the instructions in the `README.md` file:

```bash
cd web
npm i
npm run start
``` 

Currently, our prototype includes the core structure and key components. The initial workload distribution went smoothly, and each team member contributed effectively. The following elements are already implemented:
- **Map** **&** **Side** **Panel**: The map features team logos, and the corresponding side panel appears upon interaction. These components were built using *Leaflet.js*.
- **General** **website** **structure**: The main layout is functional and includes embedded visualizations.
- **Overhead** **&** **Scrollbar**: The top navigation bar and scrollbar are implemented with active hyperlinks and dropdowns.

Left to do are:
- **Clean-up**: The overall layout needs visual refinement, and alignment between sections must be improved.
- **Map**: A few team logos appear misplaced and require hardcoded coordinate adjustments.
- **Side** **Panel**: The team data displayed in the side panel must be completed and refined.

## Conclusion 

We are satisfied with our initial progress. Our expectations regarding both difficulty and workload have aligned well with our actual experience so far. The prototype provides a solid foundation, and we are confident in our path toward a complete and engaging final product.



## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone


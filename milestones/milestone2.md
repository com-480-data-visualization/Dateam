# Milestone 2 

# Presentation

As indicated by the milestone 1 we will focus on the most popular sport in European culture in this project. We focus on male football players and clubs between 2006 and 2016. Using two high-quality datasets—one on match statistics and one on player transfers—we explore how clubs and their performance have changed over time. Our goal is to show how player transfers affect team performance and how money shapes the football world. We wish to provide a comparision possibility between teams. 

Through maps and team statistics visualizations, users can travel across Europe, follow their favorite clubs, and discover patterns in transfers, spending, and success. Whether you're a fan, analyst, or scout, this project offers a new way to understand football through data.

# Design sketches 

During a meeting we kicked off the product by conceiving following design sketches. 

<table align="center">
  <tr>
    <td align="center">
      <img src="../plots/Intro.png" alt="Opening page with initial key figures" width="500" height="350">
    </td>
    <td align="center">
      <img src="../plots/Map.png" alt="Interactive Map" width="500" height="350">
    </td>
  </tr>
</table>

<table align="center">
  <tr>
    <td align="center">
      <img src="../plots/InteractiveMap.png" alt="Outfolding data visualization per selected team" width="500" height="350">
    </td>
    <td align="center">
      <img src="../plots/PageDescirption.png" alt="Final descriptive page" width="500" height="350">
    </td>
  </tr>
</table>

# Tools

We wish to characterize each club with a it's respective logo. To realize our vision we have integrated a new dataset that provides us with the major european team logos (~500 logos free of access): 

- **luukhopman**, “Football Team Logos 2024/2025”, 2024.  
   [Dataset Link](https://github.com/luukhopman/football-logos?)

To design our website we need following tools, and design pieces:
 
-   **General**, Initial idea, widget selection and a good storytelling. 
        *Course* *Tools*: git, github, designing viz, do and dont in viz, Text Viz, Storytelling, Perception/Color
-	**Overhead**, Overhead bar including website navigation and input parameters. 
        *Course* *Tools*: Interactions, Basic Web Developement 
-	**Map** Display an interactive map in a container 
        *Course* *Tools*: Maps, Practical Maps, Leaflet, Interactions
-	**Scrollbar**, Scroll down bar to research your favorite club. 
        *Course* *Tools*: Interactions
-	**Plots**, Multiple plots to show team characteristics over time. 
        *Course* *Tools*: Graphs, Tabular Data
-	**Side** **Panel**, Popup side bar with relevant team information. 
        *Course* *Tools*: Interactions

Having established 6 containers we were able to distribute the responsibility over the 3 team members, each being responsible for a 2 containers.

# First limitations and challenges 

As we have begun working on the project we have faced some initial challenges we ar ein the midst of resolving. 
    - Linking team location to team logo and data. Because of different labelling, changes of european relevance the regrouping of the data per team has taking more time than anticiated. Some rigorous filtering ansd statistical analysis provided solution. 
    - Task attibution. The first task distribution was bad and it was unclear who was responsible for that. A meeting which listed the main objetives and necessary steps to reach them helped in identifying priorities for each collaborator. 


# Future Idea 

Future potential ideas we could consider after establishing a solid first website satisfying our main objectives: 
    - Provide a deeper analysis in the team characteristics description linking the strength and weeknesses of a team on attack and defense to the in- or outgoing of a player. 
    - A visually more appealing design of the player transition on the map. 
    - A map filter by chracteristics such as: league, spending habits or team success to enhance the comparison capabilities. 

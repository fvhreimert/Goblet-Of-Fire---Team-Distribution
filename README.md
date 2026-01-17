# Goblet of Fire - Team Distributor

![Goblet of Fire Team Distributor Screenshot](screenshot.png)

## Overview

The **Goblet of Fire Team Distributor** is a web application that randomly sorts a list of names into teams. It uses Harry Potter-themed visual effects and audio to animate the distribution process, simulating names being chosen from the Goblet of Fire.

**[View the Web Application](https://github.com/fvhreimert/Goblet-Of-Fire---Team-Distribution)**

## Key Features

*   **Theatrical Visuals:** Powered by **GSAP**, featuring flying parchment notes, magical particle bursts, shockwaves, and a mystical atmosphere.
*   **Immersive Audio:** Synchronized sound effects for name reveals and completion.
*   **Atmospheric Background:** Looped video background to set the mood.
*   **Responsive Design:** optimized for various screen sizes, including mobile and tablets.
*   **Customizable:** Adjustable delay between name reveals.

## Tech Stack

*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Animation Engine:** [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/)
    *   MotionPathPlugin
    *   Physics2DPlugin
*   **Fonts:** Google Fonts (Cinzel) & Custom Harry Potter Font
*   **Icons:** FontAwesome

## Getting Started

This is a static web application requiring no build process.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fvhreimert/Goblet-Of-Fire---Team-Distribution.git
    ```

2.  **Run the application:**
    *   Simply open `index.html` in your web browser.
    *   Or serve it locally using a static server:
        ```bash
        # Python
        python3 -m http.server

        # Node.js
        npx serve
        ```

## Usage

1.  **Set Teams:** Enter the desired number of teams.
2.  **Add Names:** Paste or type the list of names (one name per line) into the parchment input area.
3.  **Adjust Settings:** Use the slider to control the speed of the distribution (Delay between notes).
4.  **Start:** Click the **Start Distribution** button and watch the magic happen!

## Assets

*   **Background:** Video ambience.
*   **Goblet & Notes:** Custom image assets.
*   **Audio:** Magical sound effects for an immersive experience.

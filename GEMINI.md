# Project Overview

This is a Harry Potter "Goblet of Fire" themed team generator. It is a single-page web application that accepts a list of names and randomly distributes them into a specified number of teams using theatrical visual effects and sound.

## Tech Stack

*   **Frontend:** Vanilla HTML, CSS, JavaScript.
*   **Animations:** GSAP (GreenSock Animation Platform) core, plus `MotionPathPlugin` and `Physics2DPlugin`.
*   **Fonts:** Google Fonts (Cinzel, Cinzel Decorative) and a custom "HarryPotter" font.
*   **Icons:** FontAwesome.

## Getting Started

This is a static web application with no build process.

1.  **Run:**
    *   You can open `index.html` directly in a web browser.
    *   Alternatively, serve it using a static file server (e.g., `npx serve`, `python3 -m http.server`).

2.  **Usage:**
    *   Enter the number of teams.
    *   Enter a list of names (one per line).
    *   Adjust the "Delay between notes" slider if desired.
    *   Click "Start Distribution" to begin the animation sequence.

## Architecture

### `index.html`
*   The entry point of the application.
*   Contains the structure for the background video, the goblet, the control panel (inputs), and the container for teams.
*   Loads GSAP libraries from CDNs.

### `app.js`
*   Contains all application logic.
*   **`startDistribution()`**: Validates inputs, creates team containers, shuffles names, and schedules the animation sequence.
*   **`distributeName()`**: Handles the animation of a single name ("note") from the center of the screen to its assigned team using GSAP timelines.
*   **`flashNoteEffectEnhanced()`**: Generates the particle effects (flash, shockwave, sparks) when a note appears.
*   **Audio Handling**: Plays `soundeffect.mp3` for each name and `final_sound_effect.mp3` when distribution is complete.

### `styles.css`
*   Handles the visual theming using CSS variables (`--stone-dark`, `--magic-blue`, etc.).
*   Implements the "Stone Tablet" look for the control panel and team boxes.
*   Manages the responsiveness of the layout.
*   Defines the "parchment" look for the name notes using complex gradients and clip-paths.

## Key Features

*   **Visual Effects:** Uses GSAP to create complex animations including flying notes, particle bursts, and shockwaves.
*   **Sound Effects:** Synchronized audio cues for each name reveal.
*   **Responsive Design:** Adapts layout for smaller screens (mobile/tablet).
*   **Video Background:** Plays a looped video behind the interface.

## Assets

*   `background_video.mp4`: Background ambience.
*   `goblet.png`: The central visual element (referenced in CSS).
*   `note.png`: Background texture for the flying notes.
*   `soundeffect.mp3`: Sound played when a note appears.
*   `final_sound_effect.mp3`: Sound played when the last note lands.
*   `harry_potter_font.ttf`: Custom font file (referenced in CSS).

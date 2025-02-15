/* app.js */

// Event listeners for starting and restarting the distribution
document.getElementById('startButton').addEventListener('click', startDistribution);
document.getElementById('restartButton').addEventListener('click', () => location.reload());

// Unmute the background video on the first user click
function unmuteVideo() {
    const video = document.getElementById('bgVideo');
    if (video) {
        video.muted = false;
        video.play().catch(err => console.log("Error unmuting video:", err));
    }
    document.removeEventListener('click', unmuteVideo);
}
document.addEventListener('click', unmuteVideo);

// Main function to start the distribution
function startDistribution() {
    const teamCountInput = document.getElementById('teamCount');
    const namesInput = document.getElementById('names');
    const teamsContainer = document.getElementById('teams');

    const teamCount = parseInt(teamCountInput.value);
    if (isNaN(teamCount) || teamCount < 1) {
        alert("Please enter a valid number of teams.");
        return;
    }

    const names = namesInput.value.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    if (names.length === 0) {
        alert("Please enter at least one name.");
        return;
    }

    document.getElementById('controls').style.display = 'none';
    teamsContainer.innerHTML = '';

    // Create team containers
    let teams = [];
    for (let i = 0; i < teamCount; i++) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'team';
        teamDiv.id = `team-${i}`;
        const header = document.createElement('h3');
        header.textContent = `Team ${i + 1}`;
        teamDiv.appendChild(header);
        teamsContainer.appendChild(teamDiv);
        teams.push(teamDiv);
    }

    // Shuffle names and schedule animations
    shuffleArray(names);
    let currentTeamIndex = 0;
    let delay = 8000; // Initial 8 second delay
    const delayIncrement = 8000;

    names.forEach((name, index) => {
        // Schedule sound 1 second before animation
        setTimeout(() => {
            new Audio('soundeffect.mp3').play();
        }, delay - 1000);
    
        // Schedule note animation (mark final note to play a final sound effect)
        setTimeout(() => {
            distributeName(name, teams[currentTeamIndex], index === names.length - 1);
            currentTeamIndex = (currentTeamIndex + 1) % teams.length;
        }, delay);
    
        delay += delayIncrement;
    });
}

// Function to animate a note moving from the starting position to its team
function distributeName(name, teamDiv, isLast = false) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = name;
    document.body.appendChild(note);

    note.style.position = 'absolute';
    gsap.set(note, { scale: 0, x: 0, y: 0, opacity: 1, transformOrigin: "50% 50%" });

    // Get note dimensions
    const noteRect = note.getBoundingClientRect();
    // Set a fixed starting position: centered horizontally, 150px from the top
    const noteCenterX = window.innerWidth / 2;
    // Set notecenter a little above middle over y axis
    const noteCenterY = window.innerHeight / 2 - 100;
    note.style.left = (noteCenterX - noteRect.width / 2) + 'px';
    note.style.top = (noteCenterY - noteRect.height / 2) + 'px';

    // Trigger the epic flash effect at the starting position
    flashNoteEffect(noteCenterX, noteCenterY);

    // Calculate destination: center of the team container (with slight horizontal adjustment)
    const teamRect = teamDiv.getBoundingClientRect();
    const destX = teamRect.left + window.scrollX + (teamRect.width / 2) - 50;
    const destY = teamRect.top + window.scrollY + (teamRect.height / 2);

    const tl = gsap.timeline({
        onComplete: () => {
            // Append the note to its team container after animation
            teamDiv.appendChild(note);
            note.style.position = "static";
            note.style.left = "";
            note.style.top = "";
            note.style.transform = "";
            if (isLast) {
                new Audio('final_sound_effect.mp3').play();
            }
        }
    });

    // Create a random offset for the initial movement
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDistance = 100 + Math.random() * 50; // 100 to 150 pixels
    const randomX = Math.cos(randomAngle) * randomDistance;
    const randomY = Math.sin(randomAngle) * randomDistance - 100; // tweak vertical randomness if desired

    // Animate the note with a dramatic zoom, spin, pause, then a smooth move to the team container
    tl.to(note, { 
        duration: 0.8, 
        scale: 2.5,
        ease: "power2.out",
        rotation: 360,
        x: randomX,
        y: randomY,
    })
    .to(note, { 
        duration: 1,
        ease: "none",
    })
    .to(note, { 
        duration: 2,
        scale: 1,
        x: destX - noteCenterX,
        y: destY - noteCenterY,
        ease: "power2.inOut",
        rotation: 0,
    });
}

// Epic flash effect with a color shift from blue to red, a shockwave, and lightblue sparks behind the note
function flashNoteEffect(centerX, centerY) {
    const flashSize = 500;
    
    // Create the main flash element with a radial gradient background
    const flash = document.createElement('div');
    flash.className = 'big-flash';
    flash.style.cssText = `
        width: ${flashSize}px;
        height: ${flashSize}px;
        left: ${centerX - flashSize / 2}px;
        top: ${centerY - flashSize / 2}px;
        pointer-events: none;
        z-index: 1;
    `;
    document.body.appendChild(flash);
    gsap.set(flash, { transformOrigin: "50% 50%" });

    // Animate the flash element: scale up, rotate, fade out, and shift its color from blue to red
    gsap.fromTo(
        flash,
        { scale: 0, opacity: 1, rotation: 0 },
        { 
            duration: 2.5,
            scale: 4,
            opacity: 0,
            rotation: 360,
            ease: "expo.out",
            onUpdate: function() {
                // Interpolate color from blue (rgba(0,150,255,0.9)) to red (rgba(255,0,0,0.9))
                const progress = this.progress();
                const r = Math.round(0 + progress * (255 - 0));
                const g = Math.round(150 - progress * 150);
                const b = Math.round(255 - progress * 255);
                flash.style.setProperty('--flash-color', `rgba(${r}, ${g}, ${b}, 0.9)`);
            },
            onComplete: () => flash.remove()
        }
    );

    // Create an extra shockwave element to make the effect even more epic
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    shockwave.style.cssText = `
        width: ${flashSize}px;
        height: ${flashSize}px;
        left: ${centerX - flashSize / 2}px;
        top: ${centerY - flashSize / 2}px;
        pointer-events: none;
        z-index: 0;
    `;
    document.body.appendChild(shockwave);
    gsap.set(shockwave, { transformOrigin: "50% 50%" });
    gsap.fromTo(
        shockwave,
        { scale: 0, opacity: 0.7 },
        { 
            duration: 2,
            scale: 5,
            opacity: 0,
            ease: "power2.out",
            onComplete: () => shockwave.remove()
        }
    );

    // Create sparks for an explosive effect (these remain lightblue)
    const sparkCount = 100;
    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        // Ensure sparks appear behind the note
        spark.style.zIndex = 0;
        document.body.appendChild(spark);
        // Position each spark at the center (assume spark size is 10px)
        spark.style.left = (centerX - 5) + 'px';
        spark.style.top = (centerY - 5) + 'px';
        gsap.set(spark, { x: 0, y: 0, opacity: 1, scale: 1 });

        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 1000;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        gsap.to(spark, {
            duration: 1.5,
            x: x,
            y: y,
            opacity: 0,
            scale: 0.5,
            ease: "power2.out",
            onComplete: () => spark.remove()
        });
    }
}


// Utility: Shuffle the names array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

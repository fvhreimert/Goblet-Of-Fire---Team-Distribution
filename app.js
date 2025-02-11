/* app.js */
document.getElementById('startButton').addEventListener('click', startDistribution);

function unmuteVideo() {
    const video = document.getElementById('bgVideo');
    if (video) {
        video.muted = false;
        video.play().catch(err => console.log("Error unmuting video:", err));
    }
    document.removeEventListener('click', unmuteVideo);
}
document.addEventListener('click', unmuteVideo);

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

    shuffleArray(names);

    let currentTeamIndex = 0;
    let delay = 8000; // Initial 8 second delay
    const delayIncrement = 8000;

    names.forEach((name, index) => {
        // Schedule sound 1 second before animation
        setTimeout(() => {
            new Audio('soundeffect.mp3').play();
        }, delay - 1000);
    
        // Schedule animation and pass true if this is the final name
        setTimeout(() => {
            distributeName(name, teams[currentTeamIndex], index === names.length - 1);
            currentTeamIndex = (currentTeamIndex + 1) % teams.length;
        }, delay);
    
        delay += delayIncrement;
    });
    
}

function distributeName(name, teamDiv, isLast = false) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = name;
    document.body.appendChild(note);

    note.style.position = 'absolute';
    gsap.set(note, { scale: 0, x: 0, y: 0, opacity: 1, transformOrigin: "50% 50%" });

    const goblet = document.getElementById('goblet');
    const gobletRect = goblet.getBoundingClientRect();
    const noteRect = note.getBoundingClientRect();

    // Calculate positions with scroll offsets
    const gobletCenterX = gobletRect.left + window.scrollX + (gobletRect.width / 2);
    const gobletCenterY = gobletRect.top + window.scrollY + (gobletRect.height / 2);

    const noteCenterX = gobletCenterX - 40;
    const noteCenterY = gobletCenterY - 100;

    // Use dynamic note dimensions
    note.style.left = (noteCenterX - noteRect.width / 2) + 'px';
    note.style.top = (noteCenterY - noteRect.height / 2) + 'px';

    flashNoteEffect(noteCenterX, noteCenterY);

    // Calculate destination with scroll offsets
    const teamRect = teamDiv.getBoundingClientRect();
    const destX = teamRect.left + window.scrollX + (teamRect.width / 2);
    const destY = teamRect.top + window.scrollY + (teamRect.height / 2);

    const tl = gsap.timeline({
        onComplete: () => {
            teamDiv.appendChild(note);
            note.style.position = "static";
            note.style.left = "";
            note.style.top = "";
            note.style.transform = "";
            // Play final sound effect if this was the last note
            if (isLast) {
                new Audio('final_sound_effect.mp3').play();
            }
        }
    });

    // Randomize the final position around the center after spinning
    const randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
    const randomDistance = 100 + Math.random() * 50; // Random distance from center (100 to 150 pixels)
    const randomX = Math.cos(randomAngle) * randomDistance; // Random X offset
    const randomY = Math.sin(randomAngle) * randomDistance; // Random Y offset

    // Enhanced animation
    tl.to(note, { 
        duration: 0.8, 
        scale: 2.5, // Zoom in dramatically
        ease: "power2.out",
        rotation: 360, // Spin the note once
        x: randomX, // Move to a random X offset
        y: randomY, // Move to a random Y offset
    })
    .to(note, { 
        duration: 1, 
        ease: "none", // Pause for readability
    })
    .to(note, { 
        duration: 2,
        scale: 1,
        x: destX - noteCenterX,
        y: destY - noteCenterY,
        ease: "power2.inOut",
        rotation: 0, // No spinning during final movement
    });
}

document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();
});

function flashNoteEffect(centerX, centerY) {
    const flash = document.createElement('div');
    flash.className = 'big-blue-flash';
    
    const flashSize = 500;
    flash.style.cssText = `
        position: absolute;
        width: ${flashSize}px;
        height: ${flashSize}px;
        left: ${centerX - flashSize/2}px;
        top: ${centerY - flashSize/2}px;
        pointer-events: none;
    `;
    
    document.body.appendChild(flash);
    gsap.set(flash, { transformOrigin: "50% 50%" });

    gsap.fromTo(flash,
        { scale: 0, opacity: 1, rotation: 0 },
        { 
            duration: 2.5,
            scale: 4,
            opacity: 0,
            rotation: 360,
            ease: "expo.out",
            onComplete: () => flash.remove()
        }
    );
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
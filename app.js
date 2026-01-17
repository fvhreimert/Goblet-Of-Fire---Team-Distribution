/* app.js */

// State to store names entered one by one
let enteredNames = [];
let pendingPositions = []; // Track positions of floating notes to avoid overlap

// Event listeners
document.getElementById('startButton').addEventListener('click', onStartClick);
document.getElementById('restartButton').addEventListener('click', () => location.reload());

// Helper for team count spinners
function setupTeamCountControls() {
    const input = document.getElementById('teamCount');
    const minusBtn = document.getElementById('teamCountMinus');
    const plusBtn = document.getElementById('teamCountPlus');

    if (minusBtn && plusBtn && input) {
        minusBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 1;
            if (val > 1) {
                input.value = val - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            let val = parseInt(input.value) || 1;
            input.value = val + 1;
        });
    }
}

// Setup Name Input "Enter" Key and Add Button
function setupNameInput() {
    const nameInput = document.getElementById('nameInput');
    const addNameBtn = document.getElementById('addNameBtn');
    
    if (!nameInput) return;

    const handleAddName = () => {
        const name = nameInput.value.trim();
        if (name) {
            addPendingNote(name);
            nameInput.value = ''; // Clear input
            nameInput.focus(); // Keep focus for rapid entry
        }
    };

    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleAddName();
        }
    });

    if (addNameBtn) {
        addNameBtn.addEventListener('click', handleAddName);
    }
}

// Initialize controls
setupTeamCountControls();
setupNameInput();


// Unmute the background video on the first user click
function unmuteVideo() {
    const video = document.getElementById('bgVideo');
    if (video && video.muted) {
        video.muted = false;
        video.play().catch(err => console.log("Error unmuting video:", err));
    }
    if (video) {
        document.removeEventListener('click', unmuteVideo);
    }
}
document.addEventListener('click', unmuteVideo, { once: true });


// 1. Add a note to the pending list and animate it
function addPendingNote(name) {
    enteredNames.push(name);

    // Create the visual note element
    const note = document.createElement('div');
    note.className = 'pending-note';
    note.textContent = name;
    // Append to #background to ensure it shares context with controls and is visible
    document.getElementById('background').appendChild(note);

    // Get input position to start animation from
    const input = document.getElementById('nameInput');
    const inputRect = input.getBoundingClientRect();
    // Calculate center of input relative to viewport, which matches fixed background
    const startX = inputRect.left + inputRect.width / 2;
    const startY = inputRect.top + inputRect.height / 2;

    // Find a non-overlapping destination
    const noteW = 120; // approximate width
    const noteH = 60;  // approximate height
    const safeRadius = 80; // Distance check radius (circular approximation)

    let destX, destY;
    let safeFound = false;
    let attempts = 0;

    while (!safeFound && attempts < 50) {
        attempts++;
        // Generate random candidate
        destX = gsap.utils.random(window.innerWidth * 0.1, window.innerWidth * 0.9);
        destY = gsap.utils.random(window.innerHeight * 0.6, window.innerHeight * 0.9);

        // Check collision against all existing positions
        let collision = false;
        for (let pos of pendingPositions) {
            const dx = destX - pos.x;
            const dy = destY - pos.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < safeRadius) {
                collision = true;
                break;
            }
        }
        
        if (!collision) {
            safeFound = true;
        }
    }

    // Store position
    pendingPositions.push({ x: destX, y: destY });


    // Animate appearance
    gsap.set(note, {
        x: startX - 60, // approximate center of note width
        y: startY - 28, // approximate center of note height
        scale: 0.5, // Start slightly visible in size
        opacity: 0,
        rotation: 0
    });

    gsap.to(note, {
        duration: 1.2,
        x: destX - 60, // Center on random point
        y: destY - 28,
        scale: 1,
        opacity: 1,
        rotation: gsap.utils.random(-20, 20),
        ease: "back.out(1.2)",
        onComplete: () => {
            // Add a repeating floating idle animation
            gsap.to(note, {
                y: "+=15",
                rotation: "+=5",
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
            gsap.to(note, {
                x: "+=10",
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    });
}

// 2. Handle Start Button Click
function onStartClick() {
    const teamCountInput = document.getElementById('teamCount');
    const teamCount = parseInt(teamCountInput.value);

    if (isNaN(teamCount) || teamCount < 1) {
        alert("Please enter a valid number of teams.");
        return;
    }

    if (enteredNames.length === 0) {
        alert("Please enter at least one name.");
        return;
    }

    // Hide controls
    document.getElementById('controls').style.display = 'none';
    
    // Animate all pending notes into the Goblet
    suckNotesIntoGoblet(() => {
        // Once done, start the actual distribution logic
        startDistributionLogic(teamCount, enteredNames);
    });
}


// 3. Animation: Suck notes into goblet
function suckNotesIntoGoblet(onCompleteCallback) {
    const pendingNotes = document.querySelectorAll('.pending-note');
    if (pendingNotes.length === 0) {
        onCompleteCallback();
        return;
    }

    // Clear positions tracking
    pendingPositions = [];

    // Goblet Center
    const gobletX = window.innerWidth / 2;
    const gobletY = window.innerHeight / 2;

    const tl = gsap.timeline({
        onComplete: () => {
            // Remove DOM elements
            pendingNotes.forEach(n => n.remove());
            onCompleteCallback();
        }
    });

    // Stagger them flying in
    tl.to(pendingNotes, {
        duration: 0.8,
        x: gobletX - 60, // Center alignment
        y: gobletY - 28,
        scale: 0.1,
        opacity: 0,
        rotation: 360, // Spin into it
        stagger: 0.05,
        ease: "power2.in"
    });
}


// 4. Main Distribution Logic (Refactored to take params)
function startDistributionLogic(teamCount, names) {
    const teamsContainer = document.getElementById('teams');
    const delaySlider = document.getElementById('delaySlider');

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
        const notesContainer = document.createElement('div');
        notesContainer.className = 'notes-container';
        teamDiv.appendChild(notesContainer);
        teamsContainer.appendChild(teamDiv);
        teams.push(teamDiv);
    }

    // Read the slider value
    const delayInSeconds = parseInt(delaySlider.value);
    const initialDelay = 1000;
    const delayIncrement = delayInSeconds * 1000;

    // Shuffle names
    shuffleArray(names);

    let notesOnLeft = 0;
    let notesOnRight = 0;

    names.forEach((name, index) => {
        const currentStartTime = initialDelay + index * delayIncrement;
        const currentTeamIndex = index % teamCount;

        // Schedule highlight
        setTimeout(() => {
            teams.forEach(t => t.classList.remove('active-team'));
            teams[currentTeamIndex].classList.add('active-team');
        }, Math.max(0, currentStartTime - 1000));

        // Schedule sound
        setTimeout(() => {
            try {
                new Audio('soundeffect.mp3').play().catch(e => console.error("Error playing sound:", e));
            } catch (err) {
                console.error("Could not play sound effect:", err);
            }
        }, Math.max(0, currentStartTime - 800));

        // Schedule note animation
        setTimeout(() => {
            distributeName(name, teams[currentTeamIndex], index === names.length - 1);

            if (currentTeamIndex % 2 === 0) {
                notesOnLeft++;
                if (notesOnLeft > 8) applyTwoColumnsToSide('left', teams);
            } else {
                notesOnRight++;
                if (notesOnRight > 8) applyTwoColumnsToSide('right', teams);
            }
        }, currentStartTime);
    });

    // Cleanup highlight
    const totalTime = initialDelay + names.length * delayIncrement;
    setTimeout(() => {
        teams.forEach(t => t.classList.remove('active-team'));
    }, totalTime + 2000);
}


function distributeName(name, teamDiv, isLast = false) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = name;
    document.body.appendChild(note);

    // Initial State: Hidden "inside" the goblet
    gsap.set(note, {
        position: 'absolute',
        scale: 0,
        opacity: 0,
        transformOrigin: "50% 50%",
        zIndex: 30,
        left: '50%',
        top: '50%', // Start exactly at center (middle of goblet)
        xPercent: -50,
        yPercent: -50,
        rotationX: -90, // Start flat/hidden
        rotation: gsap.utils.random(-180, 180)
    });

    const effectCenterX = window.innerWidth / 2;
    const effectCenterY = window.innerHeight / 2 - 100; // Adjusted for visual burst location

    const effectsContainer = document.createElement('div');
    effectsContainer.style.position = 'absolute';
    effectsContainer.style.left = '0';
    effectsContainer.style.top = '0';
    effectsContainer.style.width = '100%';
    effectsContainer.style.height = '100%';
    effectsContainer.style.pointerEvents = 'none';
    effectsContainer.style.zIndex = '5';
    effectsContainer.style.background = 'transparent';
    document.body.appendChild(effectsContainer);

    flashNoteEffectEnhanced(effectCenterX, effectCenterY, effectsContainer);

    setTimeout(() => {
        effectsContainer.remove();
    }, 3000);

    const teamRect = teamDiv.getBoundingClientRect();
    const destViewX = teamRect.left + window.scrollX + teamRect.width / 2;
    const destViewY = teamRect.top + window.scrollY + teamRect.height / 2;

    const tl = gsap.timeline({
        onComplete: () => {
            const notesContainer = teamDiv.querySelector('.notes-container');
            notesContainer.appendChild(note);
            gsap.set(note, {
                position: "static",
                left: "", top: "",
                x: 0, y: 0,
                xPercent: 0, yPercent: 0,
                scale: 1, rotation: 0,
                rotationX: 0, rotationY: 0,
                opacity: 1,
                zIndex: 'auto'
             });

            if (isLast) {
                try {
                     new Audio('final_sound_effect.mp3').play().catch(e => console.error("Error playing final sound:", e));
                } catch(err) {
                     console.error("Could not play final sound effect:", err);
                }
            }
        }
    });

    // 1. Eject from Goblet
    tl.to(note, {
        duration: 0.6,
        y: -180, // Shoot up out of goblet
        scale: 1.5,
        opacity: 1,
        rotationX: 0, // Face forward
        rotation: gsap.utils.random(-10, 10), // Straighten z-rotation
        ease: "back.out(1.2)" 
    })
    // 2. Hover/Flutter (reading time)
    .to(note, {
        duration: 0.8,
        y: "-=20", // Float up a little more or bob
        rotationY: gsap.utils.random(-20, 20), // 3D flutter
        ease: "sine.inOut"
    })
    // 3. Fly to team
    .to(note, {
        duration: 1.2,
        x: (destViewX - window.innerWidth / 2),
        y: (destViewY - window.innerHeight / 2),
        scale: 1,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        ease: "power2.inOut"
    });
}

function flashNoteEffectEnhanced(centerX, centerY, container) {
    const effectContainer = container;
    const safeRemove = (element) => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    };

    const flashSize = 500;
    const flash = document.createElement('div');
    flash.className = 'big-flash enhanced-flash';
    flash.style.cssText = `
        position: absolute;
        width: ${flashSize}px;
        height: ${flashSize}px;
        left: ${centerX - flashSize / 2}px;
        top: ${centerY - flashSize / 2}px;
        pointer-events: none;
    `;
    effectContainer.appendChild(flash);
    gsap.set(flash, { transformOrigin: "50% 50%" });

    gsap.fromTo(flash,
        { scale: 0, opacity: 1, rotation: 0 },
        {
            duration: 2.0, scale: 4.5, opacity: 0, rotation: 270, ease: "expo.out",
            onUpdate: function() {
                const progress = this.progress();
                const r = Math.round(0 + progress * 255);
                const g = Math.round(150 - progress * 150);
                const b = Math.round(255 - progress * 255);
                flash.style.setProperty('--flash-color', `rgba(${r}, ${g}, ${b}, 0.95)`);
            },
            onComplete: () => safeRemove(flash)
        }
    );

    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
     shockwave.style.cssText = `
        position: absolute; width: ${flashSize}px; height: ${flashSize}px;
        left: ${centerX - flashSize / 2}px; top: ${centerY - flashSize / 2}px;
        pointer-events: none;
    `;
    effectContainer.appendChild(shockwave);
    gsap.set(shockwave, { transformOrigin: "50% 50%" });
    gsap.fromTo(shockwave,
        { scale: 0, opacity: 0.7 },
        {
            duration: 1.8, scale: 5.5, opacity: 0, ease: "power2.out",
            onComplete: () => safeRemove(shockwave)
        }
    );

    const sparkCount = 80;
    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.style.position = 'absolute';
        effectContainer.appendChild(spark);
        gsap.set(spark, {
            left: centerX + 'px', top: centerY + 'px',
            xPercent: -50, yPercent: -50,
            opacity: 1, scale: 1
        });

        const angle = Math.random() * 360;
        const velocity = Math.random() * 500 + 400;
        const duration = 1.2 + Math.random() * 0.8;

        gsap.to(spark, {
            duration: duration,
            physics2D: { velocity: velocity, angle: angle, gravity: 300 },
            scale: 0, opacity: 0,
            ease: "power1.out",
            onComplete: () => safeRemove(spark)
        });
    }

    const goldSparkCount = 150;
    for (let i = 0; i < goldSparkCount; i++) {
        const goldSpark = document.createElement('div');
        goldSpark.className = 'gold-spark';
        goldSpark.style.position = 'absolute';
        effectContainer.appendChild(goldSpark);
        gsap.set(goldSpark, {
            left: centerX + 'px', top: centerY + 'px',
            xPercent: -50, yPercent: -50,
            opacity: 1, scale: gsap.utils.random(0.5, 1.0)
        });

        const angleRad = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 300;
        const duration = 0.5 + Math.random() * 0.5;

        gsap.to(goldSpark, {
            duration: duration,
            x: `+=${Math.cos(angleRad) * distance}`,
            y: `+=${Math.sin(angleRad) * distance}`,
            opacity: 0, scale: 0,
            ease: "expo.out",
            onComplete: () => safeRemove(goldSpark)
        });
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function applyTwoColumnsToSide(side, teams) {
    teams.forEach((team, index) => {
        const isLeftSide = index % 2 === 0;
        if ((side === 'left' && isLeftSide) || (side === 'right' && !isLeftSide)) {
            team.classList.add('two-columns');
        }
    });
}

document.getElementById('delaySlider').addEventListener('input', (e) => {
    document.getElementById('delayValue').textContent = e.target.value;
});
// Parse the subtitles from window.subtitlesText
function parseSRT(srtText) {
    if (!srtText) return [];
    const lines = srtText.trim().split('\n');
    const subtitles = [];
    let currentSub = {};
    let state = 'ID'; // ID, TIME, TEXT
    let textLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') {
            if (currentSub.text) {
                subtitles.push(currentSub);
                currentSub = {};
                textLines = [];
            }
            state = 'ID';
            continue;
        }
        
        if (state === 'ID') {
            if (/^\d+$/.test(line)) {
                currentSub.id = parseInt(line);
                state = 'TIME';
            }
        } else if (state === 'TIME') {
            const match = line.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
            if (match) {
                currentSub.start = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000;
                currentSub.end = parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000;
                state = 'TEXT';
            }
        } else if (state === 'TEXT') {
            textLines.push(line);
            currentSub.text = textLines.join('\n');
        }
    }
    
    if (currentSub.text) {
        subtitles.push(currentSub);
    }
    
    return subtitles;
}

// Global elements
const audio = document.getElementById('lecture-audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const progressBar = document.getElementById('progress-bar');
const progressFilled = document.getElementById('progress-filled');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const speedBtns = document.querySelectorAll('.speed-btn');

// Visual Elements
const blankSpace = document.getElementById('blank-space');
const wordCompleted = document.getElementById('word-completed');
const grammarCard = document.getElementById('grammar-breakdown-card');
const optionCards = {
    a: document.getElementById('option-a'),
    b: document.getElementById('option-b'),
    c: document.getElementById('option-c'),
    d: document.getElementById('option-d')
};
const tableRows = {
    a: document.getElementById('row-a'),
    b: document.getElementById('row-b'),
    c: document.getElementById('row-c'),
    d: document.getElementById('row-d')
};
const timelineMarkers = document.querySelectorAll('.nav-marker');
const subPrev = document.getElementById('sub-prev');
const subActive = document.getElementById('sub-active');
const subNext = document.getElementById('sub-next');
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

// Load subtitles
const subtitles = parseSRT(window.subtitlesText || "");

// State trackers
let isPlaying = false;
let duration = 0;

// Setup canvas size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 28;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Reset UI elements to original states
function resetVisualState() {
    // Blank space
    blankSpace.textContent = '_______';
    blankSpace.classList.remove('filled');
    
    // Word completed highlight
    wordCompleted.classList.remove('active');
    
    // Grammar card
    grammarCard.classList.add('hidden');
    
    // Option cards
    Object.values(optionCards).forEach(card => {
        card.classList.remove('active', 'incorrect', 'correct');
    });
    
    // Table rows
    Object.values(tableRows).forEach(row => {
        row.classList.remove('highlight-row');
    });
}

// Set active timeline marker
function setActiveMarker(timestamp) {
    timelineMarkers.forEach(marker => {
        const markerTime = parseInt(marker.getAttribute('data-timestamp'));
        if (markerTime === timestamp) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

// Update UI based on current time (Deterministic state machine)
function updateVisuals(time) {
    // 1. Reset base states
    resetVisualState();
    
    // 2. Compute active timeline marker
    let activeTimestamp = 0;
    if (time >= 109) activeTimestamp = 109;
    else if (time >= 98) activeTimestamp = 98;
    else if (time >= 80) activeTimestamp = 80;
    else if (time >= 58) activeTimestamp = 58;
    else if (time >= 45) activeTimestamp = 45;
    else if (time >= 22) activeTimestamp = 22;
    setActiveMarker(activeTimestamp);
    
    // 3. Verb highlight and Grammar card slide-in
    // The teacher starts discussing completed at 22s
    if (time >= 22) {
        grammarCard.classList.remove('hidden');
        // Keep completed highlighted during analysis
        if (time < 38) {
            wordCompleted.classList.add('active');
        }
    }
    
    // 4. Option A Analysis (giây 45.3 đến giây 57.6)
    if (time >= 45.3) {
        if (time < 58.2) {
            optionCards.a.classList.add('active');
            tableRows.a.classList.add('highlight-row');
        }
        if (time >= 57.6) {
            optionCards.a.classList.add('incorrect');
        }
    }
    
    // 5. Option B Analysis (giây 58.2 đến giây 80.3)
    if (time >= 58.2) {
        // Option B is discussed and stays high, then is selected correct at 106
        if (time < 80.3) {
            optionCards.b.classList.add('active');
            tableRows.b.classList.add('highlight-row');
        } else if (time >= 106.0) {
            // Correct choice confirmed at 106s
            optionCards.b.classList.add('correct');
            tableRows.b.classList.add('highlight-row');
            
            // Fill blank space in sentence
            blankSpace.textContent = 'satisfactorily';
            blankSpace.classList.add('filled');
        }
    }
    
    // 6. Option C Analysis (giây 80.3 đến giây 86.0)
    if (time >= 80.3) {
        if (time < 98.2) {
            // Option C active analysis
            if (time < 86.0) {
                optionCards.c.classList.add('active');
                tableRows.c.classList.add('highlight-row');
            }
        }
        if (time >= 86.0) {
            optionCards.c.classList.add('incorrect');
        }
    }
    
    // 7. Option D Analysis (giây 98.2 đến giây 99.0)
    if (time >= 98.2) {
        if (time < 106.0) {
            if (time < 99.0) {
                optionCards.d.classList.add('active');
                tableRows.d.classList.add('highlight-row');
            }
        }
        if (time >= 99.0) {
            optionCards.d.classList.add('incorrect');
        }
    }
}

// Find and render subtitles
function updateSubtitles(time) {
    let activeIndex = -1;
    
    for (let i = 0; i < subtitles.length; i++) {
        if (time >= subtitles[i].start && time <= subtitles[i].end) {
            activeIndex = i;
            break;
        }
    }
    
    if (activeIndex !== -1) {
        const activeSub = subtitles[activeIndex];
        subActive.textContent = activeSub.text;
        
        // Prev subtitle
        if (activeIndex > 0) {
            subPrev.textContent = subtitles[activeIndex - 1].text;
        } else {
            subPrev.textContent = "";
        }
        
        // Next subtitle
        if (activeIndex < subtitles.length - 1) {
            subNext.textContent = subtitles[activeIndex + 1].text;
        } else {
            subNext.textContent = "";
        }
    } else {
        // If between subtitles, find the next upcoming one
        let nextIndex = subtitles.findIndex(sub => sub.start > time);
        if (nextIndex !== -1) {
            subActive.textContent = "...";
            subNext.textContent = subtitles[nextIndex].text;
            subPrev.textContent = nextIndex > 0 ? subtitles[nextIndex - 1].text : "";
        } else {
            // End of audio
            subActive.textContent = "Bài giảng kết thúc. Hãy nhớ mẹo giải nhanh nhé!";
            subPrev.textContent = subtitles.length > 0 ? subtitles[subtitles.length - 1].text : "";
            subNext.textContent = "";
        }
    }
}

// Format time utility (MM:SS)
function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
}

// Audio events
audio.addEventListener('loadedmetadata', () => {
    duration = audio.duration;
    totalTimeEl.textContent = formatTime(duration);
    progressBar.max = duration;
});

// If browser completes loading audio later
if (audio.readyState >= 1) {
    duration = audio.duration;
    totalTimeEl.textContent = formatTime(duration);
    progressBar.max = duration;
}

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    currentTimeEl.textContent = formatTime(currentTime);
    progressBar.value = currentTime;
    
    // Sync progress bar filled background width
    const percentage = (currentTime / duration) * 100;
    progressFilled.style.width = `${percentage}%`;
    
    // Update visual states and subtitles
    updateVisuals(currentTime);
    updateSubtitles(currentTime);
});

audio.addEventListener('ended', () => {
    togglePlayState(false);
});

// Playback toggling
function togglePlayState(playForce) {
    const actionPlay = (playForce !== undefined) ? playForce : audio.paused;
    
    if (actionPlay) {
        audio.play().then(() => {
            isPlaying = true;
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }).catch(err => {
            console.log("Audio autoplay / play blocked by browser:", err);
        });
    } else {
        audio.pause();
        isPlaying = false;
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

playBtn.addEventListener('click', () => {
    togglePlayState();
});

// ProgressBar Scrubbing
progressBar.addEventListener('input', () => {
    const targetTime = parseFloat(progressBar.value);
    audio.currentTime = targetTime;
    
    const percentage = (targetTime / duration) * 100;
    progressFilled.style.width = `${percentage}%`;
    
    updateVisuals(targetTime);
    updateSubtitles(targetTime);
});

// Speed selectors
speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed'));
        audio.playbackRate = speed;
    });
});

// Interactive Jumps: option buttons and option cards
document.querySelectorAll('.option-jump-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering parent option-card click
        const timestamp = parseFloat(btn.getAttribute('data-timestamp'));
        audio.currentTime = timestamp;
        updateVisuals(timestamp);
        updateSubtitles(timestamp);
        togglePlayState(true);
    });
});

// Clicking the option card itself also seeks (makes it easier to navigate)
Object.entries(optionCards).forEach(([key, card]) => {
    card.addEventListener('click', () => {
        let timestamp = 0;
        if (key === 'a') timestamp = 45.3;
        else if (key === 'b') timestamp = 58.2;
        else if (key === 'c') timestamp = 80.3;
        else if (key === 'd') timestamp = 98.2;
        
        audio.currentTime = timestamp;
        updateVisuals(timestamp);
        updateSubtitles(timestamp);
        togglePlayState(true);
    });
});

// Clicking timeline markers
timelineMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
        const timestamp = parseFloat(marker.getAttribute('data-timestamp'));
        audio.currentTime = timestamp;
        updateVisuals(timestamp);
        updateSubtitles(timestamp);
        togglePlayState(true);
    });
});

// Procedural Multi-Wave Neon Visualizer (Siri Style)
function drawVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const audioPlaying = !audio.paused;
    ctx.lineWidth = 1.5;
    
    // Define 3 wave configurations
    const waves = [
        { amplitude: audioPlaying ? 7 : 1, frequency: 0.03, speed: 0.08, color: 'rgba(168, 85, 247, 0.7)' }, // purple
        { amplitude: audioPlaying ? 10 : 1, frequency: 0.02, speed: 0.12, color: 'rgba(6, 182, 212, 0.5)' },  // cyan
        { amplitude: audioPlaying ? 4 : 1, frequency: 0.05, speed: 0.06, color: 'rgba(244, 63, 94, 0.4)' }   // pink
    ];
    
    const time = Date.now() * 0.01;
    
    waves.forEach(w => {
        ctx.strokeStyle = w.color;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x++) {
            // Sinusoidal envelope to taper values to 0 at the left and right boundaries
            const envelope = Math.sin((x / canvas.width) * Math.PI);
            
            let speechFluctuation = 1;
            if (audioPlaying) {
                // Combine overlapping low/high frequency oscillators to simulate vocal spikes
                speechFluctuation = 0.4 + 0.6 * Math.sin(time * 0.4 + x * 0.015) * Math.cos(time * 0.15 + x * 0.005);
            }
            
            const y = (canvas.height / 2) + 
                      Math.sin(x * w.frequency + time * w.speed) * w.amplitude * envelope * speechFluctuation;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    });
    
    requestAnimationFrame(drawVisualizer);
}

// Start visualizer animation loop
drawVisualizer();

// Initialize time duration on load
window.addEventListener('load', () => {
    if (audio.duration) {
        duration = audio.duration;
        totalTimeEl.textContent = formatTime(duration);
        progressBar.max = duration;
    }
});

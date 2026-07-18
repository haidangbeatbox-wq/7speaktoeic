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
const wordDesigners = document.getElementById('word-designers');
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
    
    // Word highlight
    wordDesigners.classList.remove('active');
    
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
        const markerTime = parseFloat(marker.getAttribute('data-timestamp'));
        if (Math.abs(markerTime - timestamp) < 0.1) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });
}

// Update UI based on current time (Deterministic state machine for Question 125)
function updateVisuals(time) {
    // 1. Reset base states
    resetVisualState();
    
    // 2. Compute active timeline marker
    let activeTimestamp = 0;
    if (time >= 129.0) activeTimestamp = 129;
    else if (time >= 93.3) activeTimestamp = 93.3;
    else if (time >= 74.3) activeTimestamp = 74.3;
    else if (time >= 57.7) activeTimestamp = 57.7;
    else if (time >= 40.0) activeTimestamp = 40;
    else if (time >= 21.0) activeTimestamp = 21;
    setActiveMarker(activeTimestamp);
    
    // 3. Highlight plural noun and grammar card slide-in
    // Teacher starts analysis at 21s
    if (time >= 21.0) {
        grammarCard.classList.remove('hidden');
        if (time < 39.9) {
            wordDesigners.classList.add('active');
        }
    }
    
    // 4. Option A Analysis (giây 39.9 đến giây 57.3)
    if (time >= 39.9) {
        if (time < 57.7) {
            optionCards.a.classList.add('active');
            tableRows.a.classList.add('highlight-row');
        }
        if (time >= 57.3) {
            optionCards.a.classList.add('incorrect');
        }
    }
    
    // 5. Option B Analysis (giây 57.7 đến giây 74.3)
    if (time >= 57.7) {
        if (time < 74.3) {
            optionCards.b.classList.add('active');
            tableRows.b.classList.add('highlight-row');
        }
        if (time >= 74.3) {
            optionCards.b.classList.add('incorrect');
        }
    }
    
    // 6. Option C Analysis (giây 74.3 đến giây 92.2)
    if (time >= 74.3) {
        if (time < 93.3) {
            if (time < 92.2) {
                optionCards.c.classList.add('active');
                tableRows.c.classList.add('highlight-row');
            }
        }
        if (time >= 92.2) {
            optionCards.c.classList.add('incorrect');
        }
    }
    
    // 7. Option D Analysis (giây 93.3 onwards. Correct selection at 112.9)
    if (time >= 93.3) {
        if (time < 112.9) {
            optionCards.d.classList.add('active');
            tableRows.d.classList.add('highlight-row');
        } else {
            // Correct choice confirmed at 112.9s
            optionCards.d.classList.add('correct');
            tableRows.d.classList.add('highlight-row');
            
            // Fill blank space in sentence
            blankSpace.textContent = 'several';
            blankSpace.classList.add('filled');
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
        // Find upcoming
        let nextIndex = subtitles.findIndex(sub => sub.start > time);
        if (nextIndex !== -1) {
            subActive.textContent = "...";
            subNext.textContent = subtitles[nextIndex].text;
            subPrev.textContent = nextIndex > 0 ? subtitles[nextIndex - 1].text : "";
        } else {
            // End
            subActive.textContent = "Bài giảng kết thúc. Hãy ghi nhớ mẹo lượng từ nhé!";
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

if (audio.readyState >= 1) {
    duration = audio.duration;
    totalTimeEl.textContent = formatTime(duration);
    progressBar.max = duration;
}

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    currentTimeEl.textContent = formatTime(currentTime);
    progressBar.value = currentTime;
    
    const percentage = (currentTime / duration) * 100;
    progressFilled.style.width = `${percentage}%`;
    
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
            console.log("Audio play blocked by browser:", err);
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
        e.stopPropagation();
        const timestamp = parseFloat(btn.getAttribute('data-timestamp'));
        audio.currentTime = timestamp;
        updateVisuals(timestamp);
        updateSubtitles(timestamp);
        togglePlayState(true);
    });
});

Object.entries(optionCards).forEach(([key, card]) => {
    card.addEventListener('click', () => {
        let timestamp = 0;
        if (key === 'a') timestamp = 40.0;
        else if (key === 'b') timestamp = 57.7;
        else if (key === 'c') timestamp = 74.3;
        else if (key === 'd') timestamp = 93.3;
        
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

// Procedural Siri-Style visualizer
function drawVisualizer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const audioPlaying = !audio.paused;
    ctx.lineWidth = 1.5;
    
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
            const envelope = Math.sin((x / canvas.width) * Math.PI);
            let speechFluctuation = 1;
            if (audioPlaying) {
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

drawVisualizer();

window.addEventListener('load', () => {
    if (audio.duration) {
        duration = audio.duration;
        totalTimeEl.textContent = formatTime(duration);
        progressBar.max = duration;
    }
});

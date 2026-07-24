// Parse the subtitles from window.subtitlesText
function parseSRT(srtText) {
    if (!srtText) return [];
    const lines = srtText.trim().split('\n');
    const subtitles = [];
    let currentSub = {};
    let state = 'ID';
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
            if (/^\d+$/.test(line)) { currentSub.id = parseInt(line); state = 'TIME'; }
        } else if (state === 'TIME') {
            const match = line.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
            if (match) {
                currentSub.start = parseInt(match[1])*3600 + parseInt(match[2])*60 + parseInt(match[3]) + parseInt(match[4])/1000;
                currentSub.end   = parseInt(match[5])*3600 + parseInt(match[6])*60 + parseInt(match[7]) + parseInt(match[8])/1000;
                state = 'TEXT';
            }
        } else if (state === 'TEXT') {
            textLines.push(line);
            currentSub.text = textLines.join('\n');
        }
    }
    if (currentSub.text) subtitles.push(currentSub);
    return subtitles;
}

// DOM elements
const audio = document.getElementById('lecture-audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const progressBar = document.getElementById('progress-bar');
const progressFilled = document.getElementById('progress-filled');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const speedBtns = document.querySelectorAll('.speed-btn');

const blankSpace = document.getElementById('blank-space');
const wordSubject1 = document.getElementById('word-subject1');
const wordSubject2 = document.getElementById('word-subject2');
const grammarCard = document.getElementById('grammar-breakdown-card');
const optionCards = {
    a: document.getElementById('option-a'),
    b: document.getElementById('option-b'),
    c: document.getElementById('option-c'),
    d: document.getElementById('option-d')
};

const timelineMarkers = document.querySelectorAll('.nav-marker');
const subPrev = document.getElementById('sub-prev');
const subActive = document.getElementById('sub-active');
const subNext = document.getElementById('sub-next');
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

const subtitles = parseSRT(window.subtitlesText || "");
const correctText = 'will have been poured';
window.correctText = correctText;
let isPlaying = false;
let duration = 0;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 28;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resetVisualState() {
    blankSpace.textContent = '_______';
    blankSpace.classList.remove('filled');
    if (wordSubject1) wordSubject1.classList.remove('active');
    if (wordSubject2) wordSubject2.classList.remove('active');
    grammarCard.classList.add('hidden');
    Object.values(optionCards).forEach(c => c.classList.remove('active','incorrect','correct'));
}

function setActiveMarker(timestamp) {
    timelineMarkers.forEach(m => {
        const t = parseFloat(m.getAttribute('data-timestamp'));
        m.classList.toggle('active', Math.abs(t - timestamp) < 0.1);
    });
}

function updateVisuals(time) {
    resetVisualState();

    let active = 0;
    if (time >= 71) active = 71;
    else if (time >= 57) active = 57;
    else if (time >= 44) active = 44;
    else if (time >= 26) active = 26;
    else if (time >= 14) active = 14;
    else if (time >= 5) active = 5;
    setActiveMarker(active);

    if (time >= 26 && time < 71) {
        if (wordSubject1) wordSubject1.classList.add('active');
        if (wordSubject2) wordSubject2.classList.add('active');
    }

    if (time >= 44) {
        grammarCard.classList.remove('hidden');
    }

    if (time >= 14) {
        if (time < 57) {
            optionCards.a.classList.add('active');
            optionCards.b.classList.add('active');
            optionCards.c.classList.add('active');
            optionCards.d.classList.add('active');
        } else {
            // Elimination at 57+
            optionCards.a.classList.add('incorrect');
            optionCards.b.classList.add('incorrect');
            optionCards.c.classList.add('correct');
            optionCards.d.classList.add('incorrect');
            blankSpace.textContent = window.correctText;
            blankSpace.classList.add('filled');
        }
    }
}

function updateSubtitles(time) {
    let activeIndex = -1;
    for (let i = 0; i < subtitles.length; i++) {
        if (time >= subtitles[i].start && time <= subtitles[i].end) { activeIndex = i; break; }
    }
    if (activeIndex !== -1) {
        subActive.textContent = subtitles[activeIndex].text;
        subPrev.textContent = activeIndex > 0 ? subtitles[activeIndex-1].text : "";
        subNext.textContent = activeIndex < subtitles.length-1 ? subtitles[activeIndex+1].text : "";
    } else {
        let nextIdx = subtitles.findIndex(s => s.start > time);
        if (nextIdx !== -1) {
            subActive.textContent = "...";
            subNext.textContent = subtitles[nextIdx].text;
            subPrev.textContent = nextIdx > 0 ? subtitles[nextIdx-1].text : "";
        } else {
            subActive.textContent = "Bài giảng kết thúc. Hãy nhớ ôn tập các từ vựng này nhé!";
            subPrev.textContent = subtitles.length > 0 ? subtitles[subtitles.length-1].text : "";
            subNext.textContent = "";
        }
    }
}

function formatTime(s) {
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m<10?'0'+m:m}:${sec<10?'0'+sec:sec}`;
}

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
    const t = audio.currentTime;
    currentTimeEl.textContent = formatTime(t);
    progressBar.value = t;
    progressFilled.style.width = `${(t/duration)*100}%`;
    updateVisuals(t);
    updateSubtitles(t);
});

audio.addEventListener('ended', () => togglePlayState(false));

function togglePlayState(force) {
    const shouldPlay = force !== undefined ? force : audio.paused;
    if (shouldPlay) {
        audio.play().then(() => { isPlaying=true; playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden'); }).catch(e=>console.log(e));
    } else {
        audio.pause(); isPlaying=false; playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden');
    }
}

playBtn.addEventListener('click', () => togglePlayState());

progressBar.addEventListener('input', () => {
    const t = parseFloat(progressBar.value);
    audio.currentTime = t;
    progressFilled.style.width = `${(t/duration)*100}%`;
    updateVisuals(t); updateSubtitles(t);
});

speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        speedBtns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        audio.playbackRate = parseFloat(btn.getAttribute('data-speed'));
    });
});

document.querySelectorAll('.option-jump-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const t = parseFloat(btn.getAttribute('data-timestamp'));
        audio.currentTime = t; updateVisuals(t); updateSubtitles(t); togglePlayState(true);
    });
});

Object.entries(optionCards).forEach(([key, card]) => {
    card.addEventListener('click', () => {
        let t = 57;
        audio.currentTime = t; updateVisuals(t); updateSubtitles(t); togglePlayState(true);
    });
});

timelineMarkers.forEach(marker => {
    marker.addEventListener('click', () => {
        const t = parseFloat(marker.getAttribute('data-timestamp'));
        audio.currentTime = t; updateVisuals(t); updateSubtitles(t); togglePlayState(true);
    });
});

// Siri-like visualizer
function drawVisualizer() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const playing = !audio.paused;
    ctx.lineWidth = 1.5;
    const waves = [
        {amplitude:playing?7:1, frequency:0.03, speed:0.08, color:'rgba(168,85,247,0.7)'},
        {amplitude:playing?10:1, frequency:0.02, speed:0.12, color:'rgba(6,182,212,0.5)'},
        {amplitude:playing?4:1, frequency:0.05, speed:0.06, color:'rgba(244,63,94,0.4)'}
    ];
    const time = Date.now()*0.01;
    waves.forEach(w => {
        ctx.strokeStyle = w.color; ctx.beginPath();
        for (let x=0; x<canvas.width; x++) {
            const env = Math.sin((x/canvas.width)*Math.PI);
            let sf = 1;
            if (playing) sf = 0.4+0.6*Math.sin(time*0.4+x*0.015)*Math.cos(time*0.15+x*0.005);
            const y = (canvas.height/2)+Math.sin(x*w.frequency+time*w.speed)*w.amplitude*env*sf;
            x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
    });
    requestAnimationFrame(drawVisualizer);
}
drawVisualizer();

window.addEventListener('load', () => {
    if (audio.duration) { duration=audio.duration; totalTimeEl.textContent=formatTime(duration); progressBar.max=duration; }
});

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

const qBlocks = [
    document.getElementById('q1'),
    document.getElementById('q2'),
    document.getElementById('q3'),
    document.getElementById('q4'),
    document.getElementById('q5')
];
const timelineMarkers = document.querySelectorAll('.nav-marker');
const subPrev = document.getElementById('sub-prev');
const subActive = document.getElementById('sub-active');
const subNext = document.getElementById('sub-next');
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

const keywords = {
    'kw-q1-1': document.getElementById('kw-q1-1'),
    'kw-q1-2': document.getElementById('kw-q1-2'),
    'proof-q1': document.getElementById('proof-q1'),
    'kw-q2-1': document.getElementById('kw-q2-1'),
    'kw-q2-2': document.getElementById('kw-q2-2'),
    'proof-q2': document.getElementById('proof-q2'),
    'kw-q3-1': document.getElementById('kw-q3-1'),
    'proof-q3': document.getElementById('proof-q3'),
    'kw-q4-1': document.getElementById('kw-q4-1'),
    'kw-q4-2': document.getElementById('kw-q4-2'),
    'proof-q4-5': document.getElementById('proof-q4-5'),
    'kw-q5-1': document.getElementById('kw-q5-1'),
    'kw-q5-2': document.getElementById('kw-q5-2')
};

const qOptions = {
    q1b: document.getElementById('opt-q1-b'),
    q2c: document.getElementById('opt-q2-c'),
    q3c: document.getElementById('opt-q3-c'),
    q4b: document.getElementById('opt-q4-b'),
    q5d: document.getElementById('opt-q5-d')
};

const subtitles = parseSRT(window.subtitlesText || "");
let isPlaying = false;
let duration = 0;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 28;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resetVisualState() {
    qBlocks.forEach(q => {
        if (q) q.style.opacity = '0.3'; // dim all questions
    });
    Object.values(keywords).forEach(el => {
        if (el) el.classList.remove('active');
    });
    Object.values(qOptions).forEach(el => {
        if (el) el.style.background = '';
    });
}

function setActiveMarker(timestamp) {
    timelineMarkers.forEach(m => {
        const t = parseFloat(m.getAttribute('data-timestamp'));
        m.classList.toggle('active', Math.abs(t - timestamp) < 0.1);
    });
}

let lastActiveQ = -1;

function updateVisuals(time) {
    resetVisualState();

    let activeTime = 0;
    let activeQ = -1;
    if (time >= 128) { activeTime = 128; activeQ = 4; }
    else if (time >= 100) { activeTime = 100; activeQ = 3; }
    else if (time >= 68) { activeTime = 68; activeQ = 2; }
    else if (time >= 43) { activeTime = 43; activeQ = 1; }
    else if (time >= 17) { activeTime = 17; activeQ = 0; }

    setActiveMarker(activeTime);

    if (activeQ >= 0) {
        if (qBlocks[activeQ]) {
            qBlocks[activeQ].style.opacity = '1';
            qBlocks[activeQ].style.transition = 'opacity 0.3s ease';
            if (activeQ !== lastActiveQ) {
                // Scroll to the active question block if it changed
                qBlocks[activeQ].scrollIntoView({ behavior: 'smooth', block: 'center' });
                lastActiveQ = activeQ;
            }
        }
    } else {
        qBlocks.forEach(q => {
            if (q) q.style.opacity = '1';
        });
        lastActiveQ = -1;
    }

    // Logic for Highlights based on time
    if (time >= 17 && time < 43) {
        if (keywords['kw-q1-1']) keywords['kw-q1-1'].classList.add('active');
        if (keywords['kw-q1-2']) keywords['kw-q1-2'].classList.add('active');
        if (time >= 24) {
            if (keywords['proof-q1']) keywords['proof-q1'].classList.add('active');
        }
        if (time >= 37) {
            if (qOptions.q1b) qOptions.q1b.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 43 && time < 68) {
        if (keywords['kw-q2-1']) keywords['kw-q2-1'].classList.add('active');
        if (keywords['kw-q2-2']) keywords['kw-q2-2'].classList.add('active');
        if (time >= 50) {
            if (keywords['proof-q2']) keywords['proof-q2'].classList.add('active');
        }
        if (time >= 63) {
            if (qOptions.q2c) qOptions.q2c.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 68 && time < 100) {
        if (keywords['kw-q3-1']) keywords['kw-q3-1'].classList.add('active');
        if (time >= 79) {
            if (keywords['proof-q3']) keywords['proof-q3'].classList.add('active');
        }
        if (time >= 87) {
            if (qOptions.q3c) qOptions.q3c.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 100 && time < 128) {
        if (keywords['kw-q4-1']) keywords['kw-q4-1'].classList.add('active');
        if (keywords['kw-q4-2']) keywords['kw-q4-2'].classList.add('active');
        if (time >= 107) {
            if (keywords['proof-q4-5']) keywords['proof-q4-5'].classList.add('active');
        }
        if (time >= 124) {
            if (qOptions.q4b) qOptions.q4b.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 128) {
        if (keywords['kw-q5-1']) keywords['kw-q5-1'].classList.add('active');
        if (keywords['kw-q5-2']) keywords['kw-q5-2'].classList.add('active');
        if (time >= 142) {
            if (keywords['proof-q4-5']) keywords['proof-q4-5'].classList.add('active');
        }
        if (time >= 152) {
            if (qOptions.q5d) qOptions.q5d.style.background = 'rgba(16, 185, 129, 0.15)';
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
            subActive.textContent = "Bài giảng kết thúc. Hẹn gặp lại các bạn!";
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

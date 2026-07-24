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
    document.getElementById('q155'),
    document.getElementById('q156'),
    document.getElementById('q157'),
    document.getElementById('q158'),
    document.getElementById('vocab-section')
];
const timelineMarkers = document.querySelectorAll('.nav-marker');
const subPrev = document.getElementById('sub-prev');
const subActive = document.getElementById('sub-active');
const subNext = document.getElementById('sub-next');
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

const keywords = {
    'kw-accommodate': document.getElementById('kw-accommodate'),
    'sentence-157-1': document.getElementById('sentence-157-1'),
    'kw-flooding': document.getElementById('kw-flooding'),
    'sentence-155': document.getElementById('sentence-155'),
    'sentence-157-2': document.getElementById('sentence-157-2'),
    'kw-out-of-town': document.getElementById('kw-out-of-town'),
    'kw-union-leader': document.getElementById('kw-union-leader'),
    'sentence-156': document.getElementById('sentence-156'),
    'kw-agreeable': document.getElementById('kw-agreeable'),
    'kw-exhaustion': document.getElementById('kw-exhaustion'),
    'kw-q155-purpose': document.getElementById('kw-q155-purpose'),
    'vocab-1': document.getElementById('vocab-1'),
    'vocab-2': document.getElementById('vocab-2'),
    'vocab-3': document.getElementById('vocab-3'),
    'vocab-4': document.getElementById('vocab-4'),
    'vocab-5': document.getElementById('vocab-5'),
    'vocab-6': document.getElementById('vocab-6'),
    'vocab-7': document.getElementById('vocab-7')
};

const qOptions = {
    q155a: document.getElementById('opt-q155-a'),
    q156c: document.getElementById('opt-q156-c'),
    q157b: document.getElementById('opt-q157-b'),
    q158d: document.getElementById('opt-q158-d')
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
        if (el) {
            el.classList.remove('active');
            el.style.background = '';
            el.style.borderRadius = '';
        }
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
    if (time >= 131.4) { activeTime = 131.4; activeQ = 4; } // vocab
    else if (time >= 99.2) { activeTime = 99.2; activeQ = 3; } // q158
    else if (time >= 71.2) { activeTime = 71.2; activeQ = 2; } // q157
    else if (time >= 40.8) { activeTime = 40.8; activeQ = 1; } // q156
    else if (time >= 15.9) { activeTime = 15.9; activeQ = 0; } // q155

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

    // Highlights based on time
    if (time >= 15.9 && time < 40.8) { // q155
        if (time >= 17) if (keywords['kw-q155-purpose']) keywords['kw-q155-purpose'].classList.add('active');
        if (time >= 22) {
            if (keywords['sentence-155']) {
                keywords['sentence-155'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-155'].style.borderRadius = '4px';
            }
        }
        if (time >= 30) if (qOptions.q155a) qOptions.q155a.style.background = 'rgba(16, 185, 129, 0.15)';
    } 
    else if (time >= 40.8 && time < 71.2) { // q156
        if (time >= 48) if (keywords['kw-union-leader']) keywords['kw-union-leader'].classList.add('active');
        if (time >= 53) {
            if (keywords['sentence-156']) {
                keywords['sentence-156'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-156'].style.borderRadius = '4px';
            }
            if (keywords['kw-agreeable']) keywords['kw-agreeable'].classList.add('active');
            if (keywords['kw-exhaustion']) keywords['kw-exhaustion'].classList.add('active');
        }
        if (time >= 61) if (qOptions.q156c) qOptions.q156c.style.background = 'rgba(16, 185, 129, 0.15)';
    } 
    else if (time >= 71.2 && time < 99.2) { // q157
        if (time >= 77) {
            if (keywords['sentence-157-1']) {
                keywords['sentence-157-1'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-157-1'].style.borderRadius = '4px';
            }
            if (keywords['kw-flooding']) keywords['kw-flooding'].classList.add('active');
        }
        if (time >= 82) {
            if (keywords['sentence-157-2']) {
                keywords['sentence-157-2'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-157-2'].style.borderRadius = '4px';
            }
            if (keywords['kw-out-of-town']) keywords['kw-out-of-town'].classList.add('active');
        }
        if (time >= 90) if (qOptions.q157b) qOptions.q157b.style.background = 'rgba(16, 185, 129, 0.15)';
    }
    else if (time >= 99.2 && time < 131.4) { // q158
        if (time >= 115) {
            // Mentioning placing it at the end
            if (qOptions.q158d) qOptions.q158d.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    }
    else if (time >= 131.4) { // vocab
        if (time >= 131) if (keywords['vocab-1']) keywords['vocab-1'].classList.add('active');
        if (time >= 133) if (keywords['vocab-2']) keywords['vocab-2'].classList.add('active');
        if (time >= 135) if (keywords['vocab-3']) keywords['vocab-3'].classList.add('active');
        if (time >= 137) if (keywords['vocab-4']) keywords['vocab-4'].classList.add('active');
        if (time >= 139) if (keywords['vocab-5']) keywords['vocab-5'].classList.add('active');
        if (time >= 141) if (keywords['vocab-6']) keywords['vocab-6'].classList.add('active');
        if (time >= 143) if (keywords['vocab-7']) keywords['vocab-7'].classList.add('active');
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

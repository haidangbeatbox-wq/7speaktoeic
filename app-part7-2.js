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
    document.getElementById('q153'),
    document.getElementById('q154'),
    document.getElementById('vocab-section')
];
const timelineMarkers = document.querySelectorAll('.nav-marker');
const subPrev = document.getElementById('sub-prev');
const subActive = document.getElementById('sub-active');
const subNext = document.getElementById('sub-next');
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');

const keywords = {
    'header-to': document.getElementById('header-to'),
    'header-from': document.getElementById('header-from'),
    'header-date': document.getElementById('header-date'),
    'header-subject': document.getElementById('header-subject'),
    'kw-date': document.getElementById('kw-date'),
    'sentence-153': document.getElementById('sentence-153'),
    'kw-announce': document.getElementById('kw-announce'),
    'kw-digital-edition': document.getElementById('kw-digital-edition'),
    'kw-q153-1': document.getElementById('kw-q153-1'),
    'kw-q153-2': document.getElementById('kw-q153-2'),
    'sentence-154': document.getElementById('sentence-154'),
    'kw-your-code': document.getElementById('kw-your-code'),
    'kw-next-month': document.getElementById('kw-next-month'),
    'kw-print-magazine': document.getElementById('kw-print-magazine'),
    'kw-q154-1': document.getElementById('kw-q154-1'),
    'kw-q154-2': document.getElementById('kw-q154-2'),
    'vocab-1': document.getElementById('vocab-1'),
    'vocab-2': document.getElementById('vocab-2'),
    'vocab-3': document.getElementById('vocab-3')
};

const qOptions = {
    q153c: document.getElementById('opt-q153-c'),
    q154d: document.getElementById('opt-q154-d')
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
    let s1 = document.getElementById('sentence-153');
    if (s1) s1.style.background = 'transparent';
    let s2 = document.getElementById('sentence-154');
    if (s2) s2.style.background = 'transparent';
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
    if (time >= 117) { activeTime = 117; activeQ = 2; }
    else if (time >= 75) { activeTime = 75; activeQ = 1; }
    else if (time >= 36) { activeTime = 36; activeQ = 0; }
    else if (time >= 12) { activeTime = 12; activeQ = -1; }

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
    if (time >= 12 && time < 36) {
        if (time >= 12) {
            ['header-to', 'header-from', 'header-subject'].forEach(id => {
                if (keywords[id]) keywords[id].classList.add('active');
            });
        }
        if (time >= 25) {
            if (keywords['kw-date']) keywords['kw-date'].classList.add('active');
        }
    } else if (time >= 36 && time < 75) {
        if (time >= 39) {
            if (keywords['kw-q153-1']) keywords['kw-q153-1'].classList.add('active');
            if (keywords['kw-q153-2']) keywords['kw-q153-2'].classList.add('active');
        }
        if (time >= 47 && time < 63) {
            if (keywords['sentence-153']) {
                keywords['sentence-153'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-153'].style.borderRadius = '4px';
            }
        }
        if (time >= 55) {
            if (keywords['kw-announce']) keywords['kw-announce'].classList.add('active');
            if (keywords['kw-digital-edition']) keywords['kw-digital-edition'].classList.add('active');
        }
        if (time >= 63) {
            if (qOptions.q153c) qOptions.q153c.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 75 && time < 117) {
        if (time >= 78) {
            if (keywords['kw-q154-1']) keywords['kw-q154-1'].classList.add('active');
            if (keywords['kw-q154-2']) keywords['kw-q154-2'].classList.add('active');
        }
        if (time >= 86 && time < 97) {
            if (keywords['kw-date']) keywords['kw-date'].classList.add('active');
        }
        if (time >= 97 && time < 102) {
            if (keywords['sentence-154']) {
                keywords['sentence-154'].style.background = 'rgba(168, 85, 247, 0.15)';
                keywords['sentence-154'].style.borderRadius = '4px';
            }
        }
        if (time >= 102) {
            if (keywords['kw-next-month']) keywords['kw-next-month'].classList.add('active');
            if (time >= 104) if (keywords['kw-print-magazine']) keywords['kw-print-magazine'].classList.add('active');
            if (time >= 108) if (keywords['kw-your-code']) keywords['kw-your-code'].classList.add('active');
        }
        if (time >= 111) {
            if (qOptions.q154d) qOptions.q154d.style.background = 'rgba(16, 185, 129, 0.15)';
        }
    } else if (time >= 117) {
        if (time >= 119) { if (keywords['vocab-1']) keywords['vocab-1'].classList.add('active'); }
        if (time >= 121) { if (keywords['vocab-2']) keywords['vocab-2'].classList.add('active'); }
        if (time >= 123) { if (keywords['vocab-3']) keywords['vocab-3'].classList.add('active'); }
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

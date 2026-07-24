const fs = require('fs');

function createSubtitles(num) {
    const content = fs.readFileSync(`subtitles-${num}.srt`, 'utf8');
    const jsContent = 'window.subtitlesText = `' + content.replace(/`/g, '\\`') + '`;';
    fs.writeFileSync(`subtitles-${num}.js`, jsContent, 'utf8');
}

function createFiles(num, markers, correctAns, qHtml, oHtml, eHtml) {
    let appJs = fs.readFileSync('app-10.js', 'utf8');
    
    appJs = appJs.replace(/if \(time >= 63\) active = 63;\s*else if \(time >= 53\) active = 53;\s*else if \(time >= 31\) active = 31;\s*else if \(time >= 23\) active = 23;\s*else if \(time >= 13\) active = 13;\s*else if \(time >= 7\) active = 7;/, 
        `if (time >= ${markers[5]}) active = ${markers[5]};\n    else if (time >= ${markers[4]}) active = ${markers[4]};\n    else if (time >= ${markers[3]}) active = ${markers[3]};\n    else if (time >= ${markers[2]}) active = ${markers[2]};\n    else if (time >= ${markers[1]}) active = ${markers[1]};\n    else if (time >= ${markers[0]}) active = ${markers[0]};`);
    
    appJs = appJs.replace(/if \(time >= 23 && time < 63\)/, `if (time >= ${markers[2]} && time < ${markers[5]})`);
    appJs = appJs.replace(/if \(time >= 31\)/, `if (time >= ${markers[3]})`);
    appJs = appJs.replace(/if \(time >= 13\)/, `if (time >= ${markers[1]})`);
    appJs = appJs.replace(/if \(time < 53\)/, `if (time < ${markers[4]})`);
    
    let elStr = '';
    ['a','b','c','d'].forEach(k => {
        if (k === correctAns) {
            elStr += `            optionCards.${k}.classList.add('correct');\n`;
        } else {
            elStr += `            optionCards.${k}.classList.add('incorrect');\n`;
        }
    });
    
    appJs = appJs.replace(/\/\/ Elimination at 53\+[\s\S]*?blankSpace\.textContent = window\.correctText;\s*blankSpace\.classList\.add\('filled'\);/, 
        `// Elimination at ${markers[4]}+\n${elStr}            blankSpace.textContent = window.correctText;\n            blankSpace.classList.add('filled');`);
    
    appJs = appJs.replace(/let t = 53;/, `let t = ${markers[4]};`);
    
    let ansText = num === 14 ? 'will have been poured' : num === 15 ? 'fostering' : 'for';
    appJs = appJs.replace(/const correctText = 'highly';/, `const correctText = '${ansText}';`);
    
    fs.writeFileSync(`app-${num}.js`, appJs, 'utf8');

    let player = fs.readFileSync('player-10.html', 'utf8');
    
    player = player.replace(/Câu 10: Ngữ pháp\/Từ vựng/g, `Câu ${num}: Ngữ pháp/Từ vựng`);
    player = player.replace(/câu 10/g, `câu ${num}`);
    player = player.replace(/Part 5 - Câu 10/g, `Part 5 - Câu ${num}`);
    player = player.replace(/TOEIC Question 10/g, `TOEIC Question ${num}`);
    
    player = player.replace(/<p class="question-text">[\s\S]*?<\/p>/, qHtml);
    player = player.replace(/<div class="options-container".*?>[\s\S]*?<\/section>/, oHtml + "\n            </section>");
    player = player.replace(/<div class="grammar-card hidden" id="grammar-breakdown-card">[\s\S]*?<\/div>\s*<!-- Subtitles Glass Panel -->/, eHtml + "\n                <!-- Subtitles Glass Panel -->");
    
    player = player.replace(/<button class="nav-marker" data-timestamp="7">/, `<button class="nav-marker" data-timestamp="${markers[0]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="13">/, `<button class="nav-marker" data-timestamp="${markers[1]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="23">/, `<button class="nav-marker" data-timestamp="${markers[2]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="31">/, `<button class="nav-marker" data-timestamp="${markers[3]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="53">/, `<button class="nav-marker" data-timestamp="${markers[4]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="63">/, `<button class="nav-marker" data-timestamp="${markers[5]}">`);
    
    player = player.replace(/src="audio-10\.wav"/g, `src="audio-${num}.wav"`);
    player = player.replace(/src="subtitles-10\.js"/g, `src="subtitles-${num}.js"`);
    player = player.replace(/src="app-10\.js"/g, `src="app-${num}.js"`);
    
    fs.writeFileSync(`player-${num}.html`, player, 'utf8');
}

// -------------------------------------------------------------
// Câu 14
const q14Html = `<p class="question-text">
                        14. By the time the foreign investors visit the site next week, the <span class="word-highlight" id="word-subject1" data-tooltip="phần móng">foundation</span> <span class="blank-space" id="blank-space">_______</span> completely.
                    </p>`;
const o14Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">is poured</span><span class="option-type">được đổ (hiện tại)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="57"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">will pour</span><span class="option-type">sẽ đổ (chủ động)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="57"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">will have been poured</span><span class="option-type">sẽ được đổ xong (bị động tương lai HT)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="57"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">has poured</span><span class="option-type">đã đổ (hiện tại hoàn thành)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="57"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e14Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Mệnh đề thời gian 'By the time + S + V(hiện tại)' báo hiệu thì Tương lai hoàn thành ở mệnh đề chính. Do phần móng (foundation) phải 'được đổ', ta dùng dạng bị động 'will have been poured'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>foreign investor (n)</span><span>nhà đầu tư nước ngoài</span></div>
                        <div class="table-row"><span>site (n)</span><span>công trường</span></div>
                        <div class="table-row"><span>foundation (n)</span><span>nền móng</span></div>
                        <div class="table-row"><span>pour (v)</span><span>đổ (bê tông)</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 15
const q15Html = `<p class="question-text">
                        15. The management team is <span class="word-highlight" id="word-subject1" data-tooltip="tận tâm, cống hiến cho việc gì">dedicated to</span> <span class="blank-space" id="blank-space">_______</span> a culture of safety across all active construction sites.
                    </p>`;
const o15Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">foster</span><span class="option-type">bồi dưỡng (v-nguyên)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="45"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">fostered</span><span class="option-type">đã bồi dưỡng (v-ed)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="45"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">fostering</span><span class="option-type">việc bồi dưỡng (v-ing)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="45"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">fosters</span><span class="option-type">bồi dưỡng (v-s)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="45"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e15Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cấu trúc 'be dedicated to + V-ing/N' (tận tâm/cống hiến cho việc gì). Do đó phải chọn danh động từ 'fostering'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>dedicated to (adj)</span><span>tận tâm với</span></div>
                        <div class="table-row"><span>foster (v)</span><span>bồi dưỡng, thúc đẩy</span></div>
                        <div class="table-row"><span>culture of safety (n)</span><span>văn hóa an toàn</span></div>
                        <div class="table-row"><span>active construction site (n)</span><span>công trường đang hoạt động</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 16
const q16Html = `<p class="question-text">
                        16. The new BIM software is <span class="word-highlight" id="word-subject1" data-tooltip="được đánh giá cao">highly regarded</span> <span class="blank-space" id="blank-space">_______</span> its seamless integration with existing CAD programs.
                    </p>`;
const o16Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">for</span><span class="option-type">vì/cho</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="39"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">in</span><span class="option-type">trong</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="39"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">to</span><span class="option-type">tới</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="39"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">with</span><span class="option-type">với</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="39"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e16Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Collocation Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cụm từ 'be highly regarded for something' có nghĩa là 'được đánh giá cao vì điều gì'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>highly regarded (adj)</span><span>được đánh giá cao</span></div>
                        <div class="table-row"><span>seamless integration (n)</span><span>sự tích hợp liền mạch</span></div>
                        <div class="table-row"><span>existing (adj)</span><span>hiện có</span></div>
                    </div>
                </div>`;

createSubtitles(14);
createSubtitles(15);
createSubtitles(16);

// 14 markers: [5, 14, 26, 44, 57, 71]
createFiles(14, [5, 14, 26, 44, 57, 71], 'c', q14Html, o14Html, e14Html);
// 15 markers: [6, 15, 26, 37, 45, 62]
createFiles(15, [6, 15, 26, 37, 45, 62], 'c', q15Html, o15Html, e15Html);
// 16 markers: [6, 14, 23, 30, 39, 57]
createFiles(16, [6, 14, 23, 30, 39, 57], 'a', q16Html, o16Html, e16Html);

console.log("Done");

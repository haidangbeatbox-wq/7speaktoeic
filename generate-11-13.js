const fs = require('fs');

function createSubtitles(num) {
    const content = fs.readFileSync(`subtitles-${num}.srt`, 'utf8');
    const jsContent = 'window.subtitlesText = `' + content.replace(/`/g, '\\`') + '`;';
    fs.writeFileSync(`subtitles-${num}.js`, jsContent, 'utf8');
}

function createFiles(num, markers, correctAns, qHtml, oHtml, eHtml) {
    let appJs = fs.readFileSync('app-10.js', 'utf8');
    
    // In app-10.js, the markers are logic is:
    // if (time >= 63) active = 63;
    // else if (time >= 53) active = 53;
    // else if (time >= 31) active = 31;
    // else if (time >= 23) active = 23;
    // else if (time >= 13) active = 13;
    // else if (time >= 7) active = 7;
    appJs = appJs.replace(/if \(time >= 63\) active = 63;\s*else if \(time >= 53\) active = 53;\s*else if \(time >= 31\) active = 31;\s*else if \(time >= 23\) active = 23;\s*else if \(time >= 13\) active = 13;\s*else if \(time >= 7\) active = 7;/, 
        `if (time >= ${markers[5]}) active = ${markers[5]};\n    else if (time >= ${markers[4]}) active = ${markers[4]};\n    else if (time >= ${markers[3]}) active = ${markers[3]};\n    else if (time >= ${markers[2]}) active = ${markers[2]};\n    else if (time >= ${markers[1]}) active = ${markers[1]};\n    else if (time >= ${markers[0]}) active = ${markers[0]};`);
    
    // if (time >= 23 && time < 63)
    appJs = appJs.replace(/if \(time >= 23 && time < 63\)/, `if (time >= ${markers[2]} && time < ${markers[5]})`);
    // if (time >= 31)
    appJs = appJs.replace(/if \(time >= 31\)/, `if (time >= ${markers[3]})`);
    // if (time >= 13)
    appJs = appJs.replace(/if \(time >= 13\)/, `if (time >= ${markers[1]})`);
    // if (time < 53)
    appJs = appJs.replace(/if \(time < 53\)/, `if (time < ${markers[4]})`);
    
    let elStr = '';
    ['a','b','c','d'].forEach(k => {
        if (k === correctAns) {
            elStr += `            optionCards.${k}.classList.add('correct');\n`;
        } else {
            elStr += `            optionCards.${k}.classList.add('incorrect');\n`;
        }
    });
    
    // // Elimination at 53+
    appJs = appJs.replace(/\/\/ Elimination at 53\+[\s\S]*?blankSpace\.textContent = window\.correctText;\s*blankSpace\.classList\.add\('filled'\);/, 
        `// Elimination at ${markers[4]}+\n${elStr}            blankSpace.textContent = window.correctText;\n            blankSpace.classList.add('filled');`);
    
    // let t = 53;
    appJs = appJs.replace(/let t = 53;/, `let t = ${markers[4]};`);
    
    let ansText = num === 11 ? 'promptly' : num === 12 ? 'convincing' : 'entering';
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
// Câu 11
const q11Html = `<p class="question-text">
                        11. The train to Kyoto departs <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="mốc thời gian cụ thể">at 8:00 AM</span>, 
                        so please arrive early.
                    </p>`;
const o11Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">promptly</span><span class="option-type">đúng giờ (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">nearly</span><span class="option-type">gần như (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">highly</span><span class="option-type">rất, mức độ cao (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">smoothly</span><span class="option-type">trôi chảy (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e11Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Collocation Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Trạng từ 'promptly' thường được dùng với thời gian cụ thể (lúc mấy giờ) mang nghĩa là 'đúng giờ' (exactly at that time).
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>depart (v)</span><span>khởi hành</span></div>
                        <div class="table-row"><span>promptly (adv)</span><span>đúng giờ, ngay lập tức</span></div>
                        <div class="table-row"><span>arrive (v)</span><span>đến nơi</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 12
const q12Html = `<p class="question-text">
                        12. The financial director presented a very <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="Danh từ chỉ sự vật">argument</span>
                        for reducing expenses.
                    </p>`;
const o12Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">convince</span><span class="option-type">thuyết phục (v)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">convinced</span><span class="option-type">bị thuyết phục (adj-người)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">convincing</span><span class="option-type">có tính thuyết phục (adj-vật)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">convincingly</span><span class="option-type">một cách thuyết phục (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="38"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e12Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Chỗ trống cần một tính từ bổ nghĩa cho danh từ 'argument' (lập luận). Danh từ chỉ vật (bản chất của lập luận) nên dùng tính từ đuôi -ing ('convincing' - có tính thuyết phục).
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>financial director (n)</span><span>giám đốc tài chính</span></div>
                        <div class="table-row"><span>argument (n)</span><span>lập luận</span></div>
                        <div class="table-row"><span>reduce expense (v)</span><span>cắt giảm chi phí</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 13
const q13Html = `<p class="question-text">
                        13. <span class="word-highlight" id="word-subject1" data-tooltip="hoạt động như một giới từ">Prior to</span> 
                        <span class="blank-space" id="blank-space">_______</span> 
                        the facility, visitors must sign in at the front desk.
                    </p>`;
const o13Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">enter</span><span class="option-type">đi vào (v)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="37"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">entered</span><span class="option-type">đã đi vào (v-ed)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="37"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">entering</span><span class="option-type">việc đi vào (v-ing)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="37"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">enters</span><span class="option-type">đi vào (v-s)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="37"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e13Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cụm từ 'Prior to' hoạt động như một giới từ mang nghĩa 'trước khi'. Theo sau giới từ phải là V-ing hoặc danh từ. Do đó chọn 'entering'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>prior to (prep)</span><span>trước khi</span></div>
                        <div class="table-row"><span>facility (n)</span><span>cơ sở, tiện ích</span></div>
                        <div class="table-row"><span>sign in (v)</span><span>đăng ký vào, ghi danh</span></div>
                    </div>
                </div>`;

createSubtitles(11);
createSubtitles(12);
createSubtitles(13);

// 11 markers: [6, 13, 16, 21, 38, 48]
createFiles(11, [6, 13, 16, 21, 38, 48], 'a', q11Html, o11Html, e11Html);
// 12 markers: [6, 12, 13, 23, 38, 47]
createFiles(12, [6, 12, 13, 23, 38, 47], 'c', q12Html, o12Html, e12Html);
// 13 markers: [6, 13, 16, 23, 37, 49]
createFiles(13, [6, 13, 16, 23, 37, 49], 'c', q13Html, o13Html, e13Html);

console.log("Done");

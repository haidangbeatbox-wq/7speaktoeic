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
    
    let ansText = num === 17 ? 'In addition to' : num === 18 ? 'refunds' : 'each';
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
// Câu 17
const q17Html = `<p class="question-text">
                        17. <span class="blank-space" id="blank-space">_______</span> <span class="word-highlight" id="word-subject1" data-tooltip="mở (v-ing)">opening</span> several casual restaurants in the area, Antonio's Fried Chicken <span class="word-highlight" id="word-subject2" data-tooltip="cũng">also</span> operates a home delivery service.
                    </p>`;
const o17Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">Even though</span><span class="option-type">mặc dù</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">Rather than</span><span class="option-type">thay vì</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">As if</span><span class="option-type">cứ như thể</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">In addition to</span><span class="option-type">bên cạnh việc, ngoài việc</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="52"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e17Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Từ 'also' báo hiệu thông tin bổ sung. Cấu trúc 'In addition to + V-ing/N' (bên cạnh việc, ngoài việc) phù hợp nhất với 'opening'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>in addition to (prep)</span><span>bên cạnh việc, ngoài việc</span></div>
                        <div class="table-row"><span>casual restaurant (n)</span><span>nhà hàng bình dân</span></div>
                        <div class="table-row"><span>operate (v)</span><span>điều hành, vận hành</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 18
const q18Html = `<p class="question-text">
                        18. <span class="word-highlight" id="word-subject1" data-tooltip="khách hàng (số nhiều)">Customers</span> of Harrington Department Store are always given full <span class="blank-space" id="blank-space">_______</span> when returning purchases.
                    </p>`;
const o18Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">refund</span><span class="option-type">khoản tiền hoàn (n - số ít)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="43"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">refunds</span><span class="option-type">các khoản hoàn (n - số nhiều)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">refunded</span><span class="option-type">được hoàn (v-ed)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">refundable</span><span class="option-type">có thể hoàn lại (adj)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e18Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Sau tính từ 'full' cần một danh từ. 'refund' là danh từ đếm được, không có mạo từ (a/an) phía trước và chủ ngữ 'Customers' ở số nhiều nên danh từ phải ở dạng số nhiều 'refunds'.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>refund (n)</span><span>khoản tiền hoàn lại</span></div>
                        <div class="table-row"><span>return purchases (v)</span><span>trả lại hàng đã mua</span></div>
                        <div class="table-row"><span>department store (n)</span><span>cửa hàng bách hóa</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 19
const q19Html = `<p class="question-text">
                        19. This year's corporate bonuses will be distributed evenly to <span class="blank-space" id="blank-space">_______</span> <span class="word-highlight" id="word-subject1" data-tooltip="phòng ban (số ít)">department</span> in the company.
                    </p>`;
const o19Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">none</span><span class="option-type">không ai/không cái nào</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">each</span><span class="option-type">mỗi, từng (+ N đếm được số ít)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">many</span><span class="option-type">nhiều (+ N đếm được số nhiều)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">which</span><span class="option-type">đại từ quan hệ / từ để hỏi</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="48"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e19Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        'department' là danh từ đếm được số ít, do đó chỉ có 'each' (mỗi, từng) là lượng từ duy nhất có thể đi kèm.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>corporate bonus (n)</span><span>tiền thưởng công ty</span></div>
                        <div class="table-row"><span>distribute evenly (v)</span><span>phân bổ đồng đều</span></div>
                        <div class="table-row"><span>department (n)</span><span>phòng ban</span></div>
                    </div>
                </div>`;

createSubtitles(17);
createSubtitles(18);
createSubtitles(19);

// 17 markers: [5, 16, 20, 34, 52, 65]
createFiles(17, [5, 16, 20, 34, 52, 65], 'd', q17Html, o17Html, e17Html);
// 18 markers: [7, 16, 23, 43, 54, 71]
createFiles(18, [7, 16, 23, 43, 54, 71], 'b', q18Html, o18Html, e18Html);
// 19 markers: [7, 15, 25, 34, 54, 69]
createFiles(19, [7, 15, 25, 34, 54, 69], 'b', q19Html, o19Html, e19Html);

console.log("Done generating files for 17, 18, 19");

const fs = require('fs');

function createSubtitles(num) {
    const content = fs.readFileSync(`subtitles-${num}.srt`, 'utf8');
    const jsContent = 'window.subtitlesText = `' + content.replace(/`/g, '\\`') + '`;';
    fs.writeFileSync(`subtitles-${num}.js`, jsContent, 'utf8');
}

function createFiles(num, markers, correctAns, qHtml, oHtml, eHtml) {
    let appJs = fs.readFileSync('app-7.js', 'utf8');
    
    appJs = appJs.replace(/if \(time >= 55\) active = 55;\s*else if \(time >= 46\) active = 46;\s*else if \(time >= 32\) active = 32;\s*else if \(time >= 24\) active = 24;\s*else if \(time >= 14\) active = 14;\s*else if \(time >= 6\) active = 6;/, 
        `if (time >= ${markers[5]}) active = ${markers[5]};\n    else if (time >= ${markers[4]}) active = ${markers[4]};\n    else if (time >= ${markers[3]}) active = ${markers[3]};\n    else if (time >= ${markers[2]}) active = ${markers[2]};\n    else if (time >= ${markers[1]}) active = ${markers[1]};\n    else if (time >= ${markers[0]}) active = ${markers[0]};`);
    
    appJs = appJs.replace(/if \(time >= 24 && time < 55\)/, `if (time >= ${markers[2]} && time < ${markers[5]})`);
    appJs = appJs.replace(/if \(time >= 32\)/, `if (time >= ${markers[3]})`);
    appJs = appJs.replace(/if \(time >= 14\)/, `if (time >= ${markers[1]})`);
    appJs = appJs.replace(/if \(time < 46\)/, `if (time < ${markers[4]})`);
    
    let elStr = '';
    ['a','b','c','d'].forEach(k => {
        if (k === correctAns) {
            elStr += `            optionCards.${k}.classList.add('correct');\n`;
        } else {
            elStr += `            optionCards.${k}.classList.add('incorrect');\n`;
        }
    });
    
    appJs = appJs.replace(/\/\/ Elimination at 46\+[\s\S]*?blankSpace\.textContent = 'whose';\s*blankSpace\.classList\.add\('filled'\);/, 
        `// Elimination at ${markers[4]}+\n${elStr}            blankSpace.textContent = window.correctText;\n            blankSpace.classList.add('filled');`);
    
    appJs = appJs.replace(/let t = 46;/, `let t = ${markers[4]};`);
    appJs = appJs.replace('window.subtitlesText || ""', 'window.subtitlesText || ""\nconst correctText = ' + (num===8?"'expand'":num===9?"'convincing'":"'highly'") + ';\nwindow.correctText = correctText;');
    
    fs.writeFileSync(`app-${num}.js`, appJs, 'utf8');

    let player = fs.readFileSync('player-7.html', 'utf8');
    
    player = player.replace(/Câu 7: Ngữ pháp/g, `Câu ${num}: Ngữ pháp/Từ vựng`);
    player = player.replace(/câu 7/g, `câu ${num}`);
    player = player.replace(/Part 5 - Câu 7/g, `Part 5 - Câu ${num}`);
    player = player.replace(/TOEIC Question 7/g, `TOEIC Question ${num}`);
    
    player = player.replace(/<p class="question-text">[\s\S]*?<\/p>/, qHtml);
    player = player.replace(/<div class="options-container".*?>[\s\S]*?<\/section>/, oHtml + "\n            </section>");
    player = player.replace(/<div class="grammar-card hidden" id="grammar-breakdown-card">[\s\S]*?<\/div>\s*<!-- Subtitles Glass Panel -->/, eHtml + "\n                <!-- Subtitles Glass Panel -->");
    
    player = player.replace(/<button class="nav-marker" data-timestamp="6">/, `<button class="nav-marker" data-timestamp="${markers[0]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="14">/, `<button class="nav-marker" data-timestamp="${markers[1]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="24">/, `<button class="nav-marker" data-timestamp="${markers[2]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="32">/, `<button class="nav-marker" data-timestamp="${markers[3]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="46">/, `<button class="nav-marker" data-timestamp="${markers[4]}">`);
    player = player.replace(/<button class="nav-marker" data-timestamp="55">/, `<button class="nav-marker" data-timestamp="${markers[5]}">`);
    
    player = player.replace(/src="audio-7\.wav"/g, `src="audio-${num}.wav"`);
    player = player.replace(/src="subtitles-7\.js"/g, `src="subtitles-${num}.js"`);
    player = player.replace(/src="app-7\.js"/g, `src="app-${num}.js"`);
    
    fs.writeFileSync(`player-${num}.html`, player, 'utf8');
}

const q8Html = `<p class="question-text">
                        8. Apex Corp plans to <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="hoạt động kinh doanh">its operations</span>
                        <span class="word-highlight" id="word-subject2" data-tooltip="vào thị trường Châu Âu">into the European market</span> next year.
                    </p>`;
const o8Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">expand</span><span class="option-type">mở rộng (kinh doanh)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="66"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">extend</span><span class="option-type">kéo dài (thời gian/chiều dài)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="66"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">expose</span><span class="option-type">phơi bày, tiếp xúc</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="66"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">express</span><span class="option-type">bày tỏ</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="66"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e8Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Vocabulary Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Về mặt ngữ nghĩa, 'expand' được dùng phổ biến khi nói về việc mở rộng quy mô, hoạt động kinh doanh vào một thị trường mới (expand operations/business).
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>operation (n)</span><span>hoạt động (kinh doanh)</span></div>
                        <div class="table-row"><span>expand (v)</span><span>mở rộng</span></div>
                        <div class="table-row"><span>market (n)</span><span>thị trường</span></div>
                    </div>
                </div>`;

const q9Html = `<p class="question-text">
                        9. The financial director presented a very <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="Danh từ chỉ sự vật">argument</span>
                        for reducing expenses.
                    </p>`;
const o9Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">convince</span><span class="option-type">thuyết phục (v)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="72"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">convinced</span><span class="option-type">bị thuyết phục (adj-người)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="72"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">convincing</span><span class="option-type">có tính thuyết phục (adj-vật)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="72"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">convincingly</span><span class="option-type">một cách thuyết phục (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="72"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e9Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
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

const q10Html = `<p class="question-text">
                        10. The new marketing strategy has been <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="Thành công">successful</span>
                        in increasing sales.
                    </p>`;
const o10Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">highly</span><span class="option-type">rất/cao độ (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="53"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">exactly</span><span class="option-type">chính xác (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="53"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">deeply</span><span class="option-type">sâu sắc (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="53"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">sharply</span><span class="option-type">đột ngột/sắc bén (adv)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="53"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e10Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Collocation Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Trạng từ 'highly' thường kết hợp với 'successful' (highly successful) mang nghĩa là 'rất thành công'. Các trạng từ khác không kết hợp tự nhiên trong ngữ cảnh này.
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>marketing strategy (n)</span><span>chiến lược tiếp thị</span></div>
                        <div class="table-row"><span>highly successful (adj)</span><span>rất thành công</span></div>
                        <div class="table-row"><span>increase sales (v)</span><span>tăng doanh số</span></div>
                    </div>
                </div>`;

createSubtitles(8);
createSubtitles(9);
createSubtitles(10);

createFiles(8, [9, 16, 28, 40, 66, 76], 'a', q8Html, o8Html, e8Html);
createFiles(9, [8, 15, 30, 46, 72, 86], 'c', q9Html, o9Html, e9Html);
createFiles(10, [7, 13, 23, 31, 53, 63], 'a', q10Html, o10Html, e10Html);
console.log("Done");

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
    
    let ansText = num === 20 ? 'store' : num === 21 ? 'send' : 'him';
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
// Câu 20
const q20Html = `<p class="question-text">
                        20. Russell Jewels is <span class="word-highlight" id="word-subject1" data-tooltip="khai trương">opening</span> a new <span class="blank-space" id="blank-space">_______</span> in Rowland this Saturday.
                    </p>`;
const o20Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">accessory</span><span class="option-type">phụ kiện</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">design</span><span class="option-type">thiết kế</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">store</span><span class="option-type">cửa hàng</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">notice</span><span class="option-type">thông báo</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="52"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e20Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Vocabulary</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cần một danh từ chỉ địa điểm phù hợp với động từ 'opening' (khai trương). 'Store' (cửa hàng) là hợp lý nhất.<br>
                        <em>Dịch nghĩa: Russell Jewels sẽ khai trương một cửa hàng mới tại Rowland vào thứ Bảy này.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>opening (n)</span><span>sự khai trương</span></div>
                        <div class="table-row"><span>accessory (n)</span><span>phụ kiện</span></div>
                        <div class="table-row"><span>notice (n)</span><span>thông báo</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 21
const q21Html = `<p class="question-text">
                        21. Ms. Rosebush <span class="word-highlight" id="word-subject1" data-tooltip="phải">must</span> <span class="blank-space" id="blank-space">_______</span> her application form to Beal City University by September 5.
                    </p>`;
const o21Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">is sending</span><span class="option-type">hiện tại tiếp diễn</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="43"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">sending</span><span class="option-type">v-ing</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">sent</span><span class="option-type">v-ed/v3</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">send</span><span class="option-type">động từ nguyên mẫu</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e21Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Sau động từ khuyết thiếu 'must' (phải) luôn cộng với một động từ nguyên mẫu không 'to'.<br>
                        <em>Dịch nghĩa: Cô Rosebush phải gửi đơn đăng ký của mình cho Đại học Beal City trước ngày 5 tháng 9.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>application form (n)</span><span>đơn đăng ký</span></div>
                        <div class="table-row"><span>send (v)</span><span>gửi đi</span></div>
                        <div class="table-row"><span>must (modal v)</span><span>phải</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 22
const q22Html = `<p class="question-text">
                        22. Mr. Cline requested his boss to <span class="word-highlight" id="word-subject1" data-tooltip="ủy quyền">authorize</span> <span class="blank-space" id="blank-space">_______</span> to organize the event.
                    </p>`;
const o22Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">himself</span><span class="option-type">chính anh ấy (đại từ phản thân)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">his</span><span class="option-type">của anh ấy (tính từ/đại từ sở hữu)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">him</span><span class="option-type">anh ấy (đại từ tân ngữ)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">he</span><span class="option-type">anh ấy (đại từ chủ ngữ)</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="48"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e22Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Động từ 'authorize' (ủy quyền) yêu cầu một tân ngữ chỉ người ở ngay phía sau (authorize someone to do something). Tân ngữ phù hợp là 'him'.<br>
                        <em>Dịch nghĩa: Ông Cline đã yêu cầu sếp ủy quyền cho ông ấy tổ chức sự kiện.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>request (v)</span><span>yêu cầu</span></div>
                        <div class="table-row"><span>authorize (v)</span><span>ủy quyền</span></div>
                        <div class="table-row"><span>organize (v)</span><span>tổ chức</span></div>
                    </div>
                </div>`;

createSubtitles(20);
createSubtitles(21);
createSubtitles(22);

// default dummy markers
createFiles(20, [5, 10, 15, 20, 25, 30], 'c', q20Html, o20Html, e20Html);
createFiles(21, [5, 10, 15, 20, 25, 30], 'd', q21Html, o21Html, e21Html);
createFiles(22, [5, 10, 15, 20, 25, 30], 'c', q22Html, o22Html, e22Html);

console.log("Done generating files for 20, 21, 22");

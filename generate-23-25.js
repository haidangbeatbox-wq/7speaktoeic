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
    
    let ansText = num === 23 ? 'went' : num === 24 ? 'benefits' : 'take';
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
// Câu 23
const q23Html = `<p class="question-text">
                        23. Some of the administrative staff <span class="blank-space" id="blank-space">_______</span> on a business trip to <span class="word-highlight" id="word-subject1" data-tooltip="ký kết/chốt">conclude</span> a contract with a business partner.
                    </p>`;
const o23Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">went</span><span class="option-type">đã đi</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">prepared</span><span class="option-type">đã chuẩn bị</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">began</span><span class="option-type">đã bắt đầu</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">started</span><span class="option-type">đã bắt đầu</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="52"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e23Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Vocabulary</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cụm từ cố định 'go on a business trip' (đi công tác). Dựa vào ngữ cảnh câu diễn tả hành động đã xảy ra, động từ chia ở thì quá khứ 'went' là chính xác.<br>
                        <em>Dịch nghĩa: Một số nhân viên hành chính đã đi công tác để ký kết hợp đồng với đối tác kinh doanh.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>administrative staff (n)</span><span>nhân viên hành chính</span></div>
                        <div class="table-row"><span>business trip (n)</span><span>chuyến công tác</span></div>
                        <div class="table-row"><span>conclude a contract (v)</span><span>ký kết/chốt hợp đồng</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 24
const q24Html = `<p class="question-text">
                        24. To receive the full <span class="blank-space" id="blank-space">_______</span> of this coupon, please <span class="word-highlight" id="word-subject1" data-tooltip="đăng ký">register</span> the serial number at our shop's official website.
                    </p>`;
const o24Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">beneficiary</span><span class="option-type">người thụ hưởng</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="43"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">benefits</span><span class="option-type">lợi ích/ưu đãi</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">beneficial</span><span class="option-type">có lợi</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">beneficially</span><span class="option-type">một cách có lợi</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="28"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e24Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Grammar Point</h3>
                    </div>
                    <p class="grammar-explanation">
                        Chỗ trống đứng sau tính từ 'full' nên cần một danh từ. 'benefits' (lợi ích/ưu đãi) phù hợp nhất về mặt ngữ nghĩa.<br>
                        <em>Dịch nghĩa: Để nhận được toàn bộ ưu đãi của phiếu giảm giá này, vui lòng đăng ký số sê-ri tại trang web chính thức của cửa hàng chúng tôi.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>coupon (n)</span><span>phiếu giảm giá</span></div>
                        <div class="table-row"><span>register (v)</span><span>đăng ký</span></div>
                        <div class="table-row"><span>official website (n)</span><span>trang web chính thức</span></div>
                    </div>
                </div>`;

// -------------------------------------------------------------
// Câu 25
const q25Html = `<p class="question-text">
                        25. Judy Arnold <span class="word-highlight" id="word-subject1" data-tooltip="tình nguyện">volunteered</span> to <span class="blank-space" id="blank-space">_______</span> on a new research project in cooperation with senior researcher Fred Ferguson.
                    </p>`;
const o25Html = `<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
                    <button class="option-card" id="option-a" role="radio" aria-checked="false">
                        <div class="option-marker">A</div>
                        <div class="option-content"><span class="option-text">form</span><span class="option-type">hình thành</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="40"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-b" role="radio" aria-checked="false">
                        <div class="option-marker">B</div>
                        <div class="option-content"><span class="option-text">tell</span><span class="option-type">nói/kể</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="54"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-c" role="radio" aria-checked="false">
                        <div class="option-marker">C</div>
                        <div class="option-content"><span class="option-text">create</span><span class="option-type">tạo ra</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="34"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                    <button class="option-card" id="option-d" role="radio" aria-checked="false">
                        <div class="option-marker">D</div>
                        <div class="option-content"><span class="option-text">take</span><span class="option-type">đảm nhận</span></div>
                        <div class="option-status-icon"></div>
                        <div class="option-jump-btn" title="Xem giải thích đáp án này" data-timestamp="48"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-play-sm"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>
                    </button>
                </div>`;
const e25Html = `<div class="grammar-card hidden" id="grammar-breakdown-card">
                    <div class="card-header-sparkle">
                        <span class="sparkle-icon">✨</span>
                        <h3>TOEIC Vocabulary</h3>
                    </div>
                    <p class="grammar-explanation">
                        Cụm động từ 'take on' mang nghĩa là đảm nhận, gánh vác (một dự án, công việc).<br>
                        <em>Dịch nghĩa: Judy Arnold đã tình nguyện đảm nhận một dự án nghiên cứu mới hợp tác với nhà nghiên cứu cấp cao Fred Ferguson.</em>
                    </p>
                    <div class="word-family-table">
                        <div class="table-row header"><span>Từ vựng</span><span>Nghĩa</span></div>
                        <div class="table-row"><span>volunteer (v)</span><span>tình nguyện</span></div>
                        <div class="table-row"><span>research project (n)</span><span>dự án nghiên cứu</span></div>
                        <div class="table-row"><span>in cooperation with</span><span>hợp tác với</span></div>
                    </div>
                </div>`;

createSubtitles(23);
createSubtitles(24);
createSubtitles(25);

// default dummy markers
createFiles(23, [5, 10, 15, 20, 25, 30], 'a', q23Html, o23Html, e23Html);
createFiles(24, [5, 10, 15, 20, 25, 30], 'b', q24Html, o24Html, e24Html);
createFiles(25, [5, 10, 15, 20, 25, 30], 'd', q25Html, o25Html, e25Html);

console.log("Done generating files for 23, 24, 25");

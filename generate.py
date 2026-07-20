import re
import os

def create_subtitles(num):
    with open(f"subtitles-{num}.srt", "r", encoding="utf-8") as f:
        content = f.read()
    js_content = f"window.subtitlesText = `{content}`;"
    with open(f"subtitles-{num}.js", "w", encoding="utf-8") as f:
        f.write(js_content)

def create_files(num, markers, correct_ans, q_html, options_html, explanation_html):
    # App JS
    with open("app-7.js", "r", encoding="utf-8") as f:
        app_js = f.read()
    
    # replace markers logic
    app_js = re.sub(r'if \(time >= 55\) active = 55;\s+else if \(time >= 46\) active = 46;\s+else if \(time >= 32\) active = 32;\s+else if \(time >= 24\) active = 24;\s+else if \(time >= 14\) active = 14;\s+else if \(time >= 6\) active = 6;', 
                    f"if (time >= {markers[5]}) active = {markers[5]};\n    else if (time >= {markers[4]}) active = {markers[4]};\n    else if (time >= {markers[3]}) active = {markers[3]};\n    else if (time >= {markers[2]}) active = {markers[2]};\n    else if (time >= {markers[1]}) active = {markers[1]};\n    else if (time >= {markers[0]}) active = {markers[0]};", app_js)
    
    app_js = re.sub(r'if \(time >= 24 && time < 55\)', f"if (time >= {markers[2]} && time < {markers[5]})", app_js)
    app_js = re.sub(r'if \(time >= 32\)', f"if (time >= {markers[3]})", app_js)
    app_js = re.sub(r'if \(time >= 14\)', f"if (time >= {markers[1]})", app_js)
    app_js = re.sub(r'if \(time < 46\)', f"if (time < {markers[4]})", app_js)
    
    # replace elimination logic
    el_str = ""
    for k in ['a','b','c','d']:
        if k == correct_ans:
            el_str += f"            optionCards.{k}.classList.add('correct');\n"
        else:
            el_str += f"            optionCards.{k}.classList.add('incorrect');\n"
    
    app_js = re.sub(r'// Elimination at 46\+.*?blankSpace\.textContent = \'whose\';\s+blankSpace\.classList\.add\(\'filled\'\);', 
                    f"// Elimination at {markers[4]}+\n{el_str}            blankSpace.textContent = window.correctText;\n            blankSpace.classList.add('filled');", app_js, flags=re.DOTALL)
    
    app_js = re.sub(r'let t = 46;', f"let t = {markers[4]};", app_js)
    app_js = app_js.replace("window.subtitlesText || \"\"", "window.subtitlesText || \"\"\nwindow.correctText = 'CORRECT_TEXT';")
    
    if num == 8: app_js = app_js.replace("CORRECT_TEXT", "expand")
    if num == 9: app_js = app_js.replace("CORRECT_TEXT", "convincing")
    if num == 10: app_js = app_js.replace("CORRECT_TEXT", "highly")
    
    with open(f"app-{num}.js", "w", encoding="utf-8") as f:
        f.write(app_js)

    # Player HTML
    with open("player-7.html", "r", encoding="utf-8") as f:
        player = f.read()
    
    player = player.replace("Câu 7: Ngữ pháp", f"Câu {num}: Ngữ pháp/Từ vựng")
    player = player.replace("câu 7", f"câu {num}")
    player = player.replace("Part 5 - Câu 7", f"Part 5 - Câu {num}")
    player = player.replace("TOEIC Question 7", f"TOEIC Question {num}")
    
    # Replace question text
    player = re.sub(r'<p class="question-text">.*?</p>', q_html, player, flags=re.DOTALL)
    
    # Replace options
    player = re.sub(r'<div class="options-container".*?</section>', options_html + "\n            </section>", player, flags=re.DOTALL)
    
    # Replace grammar card
    player = re.sub(r'<div class="grammar-card hidden" id="grammar-breakdown-card">.*?</div>\s+<!-- Subtitles Glass Panel -->', 
                    explanation_html + "\n                <!-- Subtitles Glass Panel -->", player, flags=re.DOTALL)
    
    # Replace timeline markers
    player = re.sub(r'<button class="nav-marker" data-timestamp="6">', f'<button class="nav-marker" data-timestamp="{markers[0]}">', player)
    player = re.sub(r'<button class="nav-marker" data-timestamp="14">', f'<button class="nav-marker" data-timestamp="{markers[1]}">', player)
    player = re.sub(r'<button class="nav-marker" data-timestamp="24">', f'<button class="nav-marker" data-timestamp="{markers[2]}">', player)
    player = re.sub(r'<button class="nav-marker" data-timestamp="32">', f'<button class="nav-marker" data-timestamp="{markers[3]}">', player)
    player = re.sub(r'<button class="nav-marker" data-timestamp="46">', f'<button class="nav-marker" data-timestamp="{markers[4]}">', player)
    player = re.sub(r'<button class="nav-marker" data-timestamp="55">', f'<button class="nav-marker" data-timestamp="{markers[5]}">', player)
    
    # Replace scripts and audio
    player = player.replace('src="audio-7.wav"', f'src="audio-{num}.wav"')
    player = player.replace('src="subtitles-7.js"', f'src="subtitles-{num}.js"')
    player = player.replace('src="app-7.js"', f'src="app-{num}.js"')
    
    with open(f"player-{num}.html", "w", encoding="utf-8") as f:
        f.write(player)

q8_html = """<p class="question-text">
                        8. Apex Corp plans to <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="hoạt động kinh doanh">its operations</span>
                        <span class="word-highlight" id="word-subject2" data-tooltip="vào thị trường Châu Âu">into the European market</span> next year.
                    </p>"""

o8_html = """<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
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
                </div>"""

e8_html = """<div class="grammar-card hidden" id="grammar-breakdown-card">
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
                </div>"""

q9_html = """<p class="question-text">
                        9. The financial director presented a very <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="Danh từ chỉ sự vật">argument</span>
                        for reducing expenses.
                    </p>"""

o9_html = """<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
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
                </div>"""

e9_html = """<div class="grammar-card hidden" id="grammar-breakdown-card">
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
                </div>"""

q10_html = """<p class="question-text">
                        10. The new marketing strategy has been <span class="blank-space" id="blank-space">_______</span> 
                        <span class="word-highlight" id="word-subject1" data-tooltip="Thành công">successful</span>
                        in increasing sales.
                    </p>"""

o10_html = """<div class="options-container" role="radiogroup" aria-label="Các đáp án lựa chọn">
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
                </div>"""

e10_html = """<div class="grammar-card hidden" id="grammar-breakdown-card">
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
                </div>"""

create_subtitles(8)
create_subtitles(9)
create_subtitles(10)

create_files(8, [9, 16, 28, 40, 66, 76], 'a', q8_html, o8_html, e8_html)
create_files(9, [8, 15, 30, 46, 72, 86], 'c', q9_html, o9_html, e9_html)
create_files(10, [7, 13, 23, 31, 53, 63], 'a', q10_html, o10_html, e10_html)
print("Done!")

// ==================== Global State ====================
let isPlaying = false;
let isPaused = false;

// ==================== DOM Elements ====================
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const voiceSelect = document.getElementById('voiceSelect');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const pitchSlider = document.getElementById('pitchSlider');
const pitchValue = document.getElementById('pitchValue');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const clearBtn = document.getElementById('clearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const sampleBtn = document.getElementById('sampleBtn');

const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// ==================== Sample Vietnamese Texts ====================
const sampleTexts = [
    "Xin chào, đây là ứng dụng chuyển văn bản thành giọng nói tiếng Việt. Chất lượng giọng đọc rất tự nhiên và dễ nghe.",
    "Việt Nam là một đất nước xinh đẹp với văn hóa lâu đời và con người thân thiện. Từ Bắc chí Nam, mỗi vùng miền đều có nét đẹp riêng.",
    "Công nghệ trí tuệ nhân tạo đang phát triển mạnh mẽ, mang lại nhiều tiện ích cho cuộc sống. Chuyển văn bản thành giọng nói là một trong những ứng dụng hữu ích nhất.",
    "Hà Nội ngàn năm văn hiến, Sài Gòn hiện đại năng động, Đà Nẵng thành phố đáng sống. Mỗi thành phố đều có vẻ đẹp riêng biệt.",
    "Học tiếng Việt không khó nếu bạn kiên trì và có phương pháp phù hợp. Ngôn ngữ Việt Nam rất phong phú và đa dạng."
];

// ==================== Initialize ====================
function init() {
    loadHistory();
    setupEventListeners();
    updateCharCount();

    // Check if ResponsiveVoice is loaded
    if (typeof responsiveVoice === 'undefined') {
        alert('Không thể tải ResponsiveVoice. Vui lòng kiểm tra kết nối internet.');
    } else {
        console.log('✅ ResponsiveVoice loaded successfully');

        // Wait for voices to load
        responsiveVoice.OnVoiceReady = function () {
            console.log('✅ Vietnamese voices ready');
        };
    }
}

// ==================== Text-to-Speech ====================
function speak() {
    const text = textInput.value.trim();

    if (!text) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    if (typeof responsiveVoice === 'undefined') {
        alert('ResponsiveVoice chưa được tải. Vui lòng kiểm tra kết nối internet và tải lại trang.');
        return;
    }

    // Stop any current speech
    responsiveVoice.cancel();

    const voice = voiceSelect.value;
    const rate = parseFloat(speedSlider.value);
    const pitch = parseFloat(pitchSlider.value);
    const volume = parseFloat(volumeSlider.value) / 100;

    // Play with ResponsiveVoice
    responsiveVoice.speak(text, voice, {
        rate: rate,
        pitch: pitch,
        volume: volume,
        onstart: onSpeakStart,
        onend: onSpeakEnd,
        onerror: onSpeakError
    });

    // Save to history
    saveToHistory({
        text: text,
        voice: voice,
        speed: rate,
        pitch: pitch,
        volume: Math.round(volume * 100),
        timestamp: new Date().toISOString()
    });
}

function stopSpeaking() {
    responsiveVoice.cancel();
    onSpeakEnd();
}

function pauseSpeaking() {
    if (isPaused) {
        responsiveVoice.resume();
        isPaused = false;
        pauseBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="6" y="5" width="3" height="10" rx="1"/>
                <rect x="11" y="5" width="3" height="10" rx="1"/>
            </svg>
            Tạm dừng
        `;
    } else {
        responsiveVoice.pause();
        isPaused = true;
        pauseBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.3 3.7L12 8.5v3L6.3 16.3c-.4.4-1.1.1-1.1-.4V4.1c0-.5.7-.8 1.1-.4z"/>
            </svg>
            Tiếp tục
        `;
    }
}

function onSpeakStart() {
    isPlaying = true;
    updateButtonStates();
    console.log('🎤 Started speaking');
}

function onSpeakEnd() {
    isPlaying = false;
    isPaused = false;
    updateButtonStates();
    console.log('✅ Finished speaking');
}

function onSpeakError(event) {
    console.error('❌ Speech error:', event);
    alert('Lỗi khi phát giọng nói. Vui lòng thử lại.');
    onSpeakEnd();
}

function updateButtonStates() {
    speakBtn.disabled = isPlaying;
    stopBtn.disabled = !isPlaying;
    pauseBtn.disabled = !isPlaying;

    if (isPlaying) {
        speakBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <circle cx="10" cy="10" r="2"/>
                <circle cx="10" cy="10" r="2" opacity="0.5">
                    <animate attributeName="r" from="2" to="8" dur="1s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" from="0.5" to="0" dur="1s" repeatCount="indefinite"/>
                </circle>
            </svg>
            Đang phát...
        `;
    } else {
        speakBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.3 3.7L12 8.5v3L6.3 16.3c-.4.4-1.1.1-1.1-.4V4.1c0-.5.7-.8 1.1-.4zM14 7v6a1 1 0 002 0V7a1 1 0 00-2 0z"/>
            </svg>
            Phát giọng nói
        `;

        pauseBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="6" y="5" width="3" height="10" rx="1"/>
                <rect x="11" y="5" width="3" height="10" rx="1"/>
            </svg>
            Tạm dừng
        `;
    }
}

// ==================== History Management ====================
function saveToHistory(item) {
    let history = getHistory();
    history.unshift(item);

    if (history.length > 20) {
        history = history.slice(0, 20);
    }

    localStorage.setItem('tts_history_vi', JSON.stringify(history));
    loadHistory();
}

function getHistory() {
    const historyData = localStorage.getItem('tts_history_vi');
    return historyData ? JSON.parse(historyData) : [];
}

function loadHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2" opacity="0.3"/>
                    <path d="M24 12v12l8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
                </svg>
                <p>Chưa có lịch sử chuyển đổi</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="history-content">
                <div class="history-text">${escapeHtml(item.text)}</div>
                <div class="history-meta">
                    <span>${item.voice}</span>
                    <span>Tốc độ: ${item.speed}x</span>
                    <span>Cao độ: ${item.pitch}x</span>
                    <span>Âm lượng: ${item.volume}%</span>
                    <span>${formatTimestamp(item.timestamp)}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="icon-btn replay-btn" title="Phát lại" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.3 3.7L12 8.5v3L6.3 16.3c-.4.4-1.1.1-1.1-.4V4.1c0-.5.7-.8 1.1-.4z"/>
                    </svg>
                </button>
                <button class="icon-btn delete-btn" title="Xóa" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.replay-btn').forEach(btn => {
        btn.addEventListener('click', replayFromHistory);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteFromHistory);
    });
}

function replayFromHistory(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    const history = getHistory();
    const item = history[index];

    if (!item) return;

    textInput.value = item.text;
    voiceSelect.value = item.voice;
    speedSlider.value = item.speed;
    pitchSlider.value = item.pitch;
    volumeSlider.value = item.volume;

    updateSliderValues();
    updateCharCount();
    speak();
}

function deleteFromHistory(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let history = getHistory();
    history.splice(index, 1);
    localStorage.setItem('tts_history_vi', JSON.stringify(history));
    loadHistory();
}

function clearHistory() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
        localStorage.removeItem('tts_history_vi');
        loadHistory();
    }
}

// ==================== Utility Functions ====================
function updateCharCount() {
    charCount.textContent = textInput.value.length;
}

function updateSliderValues() {
    speedValue.textContent = speedSlider.value;
    pitchValue.textContent = pitchSlider.value;
    volumeValue.textContent = volumeSlider.value;
}

function clearText() {
    textInput.value = '';
    updateCharCount();
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        textInput.value = text;
        updateCharCount();
    } catch (err) {
        console.error('Failed to read clipboard:', err);
        alert('Không thể dán văn bản. Vui lòng cho phép quyền truy cập clipboard.');
    }
}

function loadSampleText() {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    textInput.value = sampleTexts[randomIndex];
    updateCharCount();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    textInput.addEventListener('input', updateCharCount);

    speedSlider.addEventListener('input', updateSliderValues);
    pitchSlider.addEventListener('input', updateSliderValues);
    volumeSlider.addEventListener('input', updateSliderValues);

    speakBtn.addEventListener('click', speak);
    stopBtn.addEventListener('click', stopSpeaking);
    pauseBtn.addEventListener('click', pauseSpeaking);

    clearBtn.addEventListener('click', clearText);
    pasteBtn.addEventListener('click', pasteText);
    sampleBtn.addEventListener('click', loadSampleText);

    clearHistoryBtn.addEventListener('click', clearHistory);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!isPlaying) speak();
        }

        if (e.key === 'Escape' && isPlaying) {
            stopSpeaking();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
            e.preventDefault();
            if (isPlaying) pauseSpeaking();
        }
    });
}

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', init);

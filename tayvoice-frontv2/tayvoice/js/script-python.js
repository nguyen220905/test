// ==================== Global State ====================
let isPlaying = false;
let currentAudio = null;
// Khi mở trang qua chính backend (http://localhost:8888/) thì dùng same-origin.
// Khi mở file://… thì fallback về localhost:8888.
const API_BASE = (location.protocol === 'http:' || location.protocol === 'https:')
    ? location.origin
    : 'http://localhost:8888';

// ==================== DOM Elements ====================
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const voiceSelect = document.getElementById('voiceSelect');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const pasteBtn = document.getElementById('pasteBtn');
const sampleBtn = document.getElementById('sampleBtn');

const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const statusMessage = document.getElementById('statusMessage');

// ==================== Sample Vietnamese Texts ====================
const sampleTexts = [
    "Xin chào, đây là ứng dụng chuyển văn bản thành giọng nói tiếng Việt. Chất lượng giọng đọc rất tự nhiên và dễ nghe.",
    "Việt Nam là một đất nước xinh đẹp với văn hóa lâu đời và con người thân thiện. Từ Bắc chí Nam, mỗi vùng miền đều có nét đẹp riêng.",
    "Công nghệ trí tuệ nhân tạo đang phát triển mạnh mẽ, mang lại nhiều tiện ích cho cuộc sống. Chuyển văn bản thành giọng nói là một trong những ứng dụng hữu ích nhất.",
    "Hà Nội ngàn năm văn hiến, Sài Gòn hiện đại năng động, Đà Nẵng thành phố đáng sống. Mỗi thành phố đều có vẻ đẹp riêng biệt.",
    "Học tiếng Việt không khó nếu bạn kiên trì và có phương pháp phù hợp. Ngôn ngữ Việt Nam rất phong phú và đa dạng."
];

// ==================== Initialize ====================
async function init() {
    loadHistory();
    setupEventListeners();
    updateCharCount();
    await checkServerStatus();
    loadVoices();
}

async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        if (data.backend === 'ok') {
            showStatus('✅ Server đã sẵn sàng', 'success');
        }
    } catch (error) {
        showStatus('⚠️ Không kết nối được server. Vui lòng chạy backend (python main.py)', 'error');
    }
}

async function loadVoices() {
    try {
        const response = await fetch(`${API_BASE}/api/voices`);
        const data = await response.json();

        voiceSelect.innerHTML = data.voices.map(voice =>
            `<option value="${voice.code}">${voice.name} (${voice.lang})</option>`
        ).join('');

        voiceSelect.value = 'vi'; // Default to Vietnamese
    } catch (error) {
        console.error('Failed to load voices:', error);
    }
}

// ==================== Text-to-Speech ====================
async function speak() {
    const text = textInput.value.trim();

    if (!text) {
        alert('Vui lòng nhập văn bản!');
        return;
    }

    try {
        showStatus('🎤 Đang tạo file âm thanh...', 'loading');
        speakBtn.disabled = true;

        // Slider hiển thị "Tốc độ X.Xx" (1x = bình thường, 2x = nhanh, 0.5x = chậm).
        // Backend dùng length_scale ngược lại (0.5 = nhanh, 2 = chậm) → đảo bằng 1/x.
        const speed = parseFloat(speedSlider.value);
        const lengthScale = Math.min(2.0, Math.max(0.5, 1.0 / speed));

        const response = await fetch(`${API_BASE}/api/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                length_scale: lengthScale,
                save_audio: true,
            })
        });

        const data = await response.json();

        if (data.success && data.audio_url) {
            const audioUrl = `${API_BASE}${data.audio_url}`;
            const filename = data.audio_url.split('/').pop();
            playAudio(audioUrl, filename);

            // Save to history
            saveToHistory({
                text: text,
                voice: voiceSelect.options[voiceSelect.selectedIndex].text,
                lang: voiceSelect.value,
                speed: speed,
                audioFile: filename,
                timestamp: new Date().toISOString()
            });

            showStatus('✅ Đã tạo file âm thanh', 'success');
        } else {
            throw new Error(data.message || data.detail || 'Unknown error');
        }
    } catch (error) {
        console.error('TTS Error:', error);
        showStatus('❌ Lỗi: ' + error.message, 'error');
        alert('Lỗi khi tạo giọng nói. Vui lòng kiểm tra:\n1. Server Python đã chạy chưa?\n2. Đã cài đặt dependencies chưa?');
    } finally {
        speakBtn.disabled = false;
    }
}

function playAudio(url, filename) {
    stopAudio();

    currentAudio = new Audio(url);
    currentAudio.playbackRate = parseFloat(speedSlider.value);

    currentAudio.onplay = () => {
        isPlaying = true;
        updateButtonStates();
        showStatus('🔊 Đang phát...', 'playing');
    };

    currentAudio.onended = () => {
        isPlaying = false;
        updateButtonStates();
        showStatus('✅ Đã phát xong', 'success');
    };

    currentAudio.onerror = () => {
        showStatus('❌ Lỗi khi phát file âm thanh', 'error');
        isPlaying = false;
        updateButtonStates();
    };

    currentAudio.play();

    // Enable download button
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => downloadAudio(url, filename);
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isPlaying = false;
    updateButtonStates();
}

function downloadAudio(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'tts-audio.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showStatus('💾 Đang tải xuống...', 'success');
}

function updateButtonStates() {
    speakBtn.disabled = isPlaying;
    stopBtn.disabled = !isPlaying;

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
    }
}

function showStatus(message, type = 'info') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        loading: '#f59e0b',
        playing: '#6366f1',
        info: '#6b7280'
    };

    statusMessage.textContent = message;
    statusMessage.style.color = colors[type];
    statusMessage.style.opacity = '1';

    setTimeout(() => {
        statusMessage.style.opacity = '0';
    }, 5000);
}

// ==================== History Management ====================
function saveToHistory(item) {
    let history = getHistory();
    history.unshift(item);

    if (history.length > 20) {
        history = history.slice(0, 20);
    }

    localStorage.setItem('tts_history_gtts', JSON.stringify(history));
    loadHistory();
}

function getHistory() {
    const historyData = localStorage.getItem('tts_history_gtts');
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
                    <span>${formatTimestamp(item.timestamp)}</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="icon-btn replay-btn" title="Phát lại" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6.3 3.7L12 8.5v3L6.3 16.3c-.4.4-1.1.1-1.1-.4V4.1c0-.5.7-.8 1.1-.4z"/>
                    </svg>
                </button>
                <button class="icon-btn download-btn-history" title="Tải xuống" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 3v8m0 0L7 8m3 3l3-3M4 15h12"/>
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

    document.querySelectorAll('.download-btn-history').forEach(btn => {
        btn.addEventListener('click', downloadFromHistory);
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

    if (item.audioFile) {
        const audioUrl = `${API_BASE}/audio/${item.audioFile}`;
        playAudio(audioUrl, item.audioFile);
    } else {
        textInput.value = item.text;
        voiceSelect.value = item.lang;
        speedSlider.value = item.speed;
        updateSliderValues();
        updateCharCount();
        speak();
    }
}

function downloadFromHistory(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    const history = getHistory();
    const item = history[index];

    if (item && item.audioFile) {
        const audioUrl = `${API_BASE}/audio/${item.audioFile}`;
        downloadAudio(audioUrl, item.audioFile);
    }
}

function deleteFromHistory(event) {
    const index = parseInt(event.currentTarget.dataset.index);
    let history = getHistory();
    history.splice(index, 1);
    localStorage.setItem('tts_history_gtts', JSON.stringify(history));
    loadHistory();
}

function clearHistory() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
        localStorage.removeItem('tts_history_gtts');
        loadHistory();
    }
}

// ==================== Utility Functions ====================
function updateCharCount() {
    charCount.textContent = textInput.value.length;
}

function updateSliderValues() {
    speedValue.textContent = speedSlider.value;
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
    speedSlider.addEventListener('input', () => {
        updateSliderValues();
        if (currentAudio) {
            currentAudio.playbackRate = parseFloat(speedSlider.value);
        }
    });

    speakBtn.addEventListener('click', speak);
    stopBtn.addEventListener('click', stopAudio);

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
            stopAudio();
        }
    });
}

// ==================== Speed Control Updates ====================
speedSlider.addEventListener('change', () => {
    if (currentAudio) {
        currentAudio.playbackRate = parseFloat(speedSlider.value);
    }
});

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', init);
